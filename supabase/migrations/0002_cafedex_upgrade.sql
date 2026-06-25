-- Upgrade script for the earlier Cafedex v1 schema.
-- Run this once if you already ran the original 0001_init.sql before the 10/10 upgrade.

alter table public.cafes add column if not exists trail_tags text[] not null default '{}';
alter table public.cafes add column if not exists best_drink text;
alter table public.cafes add column if not exists best_drink_th text;
alter table public.cafes add column if not exists best_time text;
alter table public.cafes add column if not exists best_time_th text;
alter table public.cafes add column if not exists why_go text;
alter table public.cafes add column if not exists why_go_th text;
alter table public.cafes add column if not exists beans_note text;
alter table public.cafes add column if not exists beans_note_th text;
alter table public.cafes add column if not exists laptop_vibe text;
alter table public.cafes add column if not exists has_sockets boolean;
alter table public.cafes add column if not exists parking text;
alter table public.cafes add column if not exists parking_th text;
alter table public.cafes add column if not exists date_spot boolean;
alter table public.cafes add column if not exists price_band text;
alter table public.cafes add column if not exists quiet_level text;
alter table public.cafes add column if not exists serious_score int;
alter table public.cafes add column if not exists photo_score int;
alter table public.cafes add column if not exists local_verified boolean not null default false;
alter table public.cafes add column if not exists updated_at timestamptz default now();

alter table public.bags add column if not exists drink text;
alter table public.bags add column if not exists brew_method text;

create table if not exists public.cafe_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  area text,
  google_maps_url text,
  note text,
  status text not null default 'new' check (status in ('new', 'reviewed', 'added', 'rejected')),
  created_at timestamptz default now()
);

create index if not exists bags_bagged_at_idx on public.bags(bagged_at desc);
create index if not exists cafes_tags_idx on public.cafes using gin(tags);
create index if not exists cafes_trail_tags_idx on public.cafes using gin(trail_tags);
create index if not exists cafe_suggestions_user_idx on public.cafe_suggestions(user_id);

alter table public.cafe_suggestions enable row level security;

drop policy if exists cafe_suggestions_select_own on public.cafe_suggestions;
create policy cafe_suggestions_select_own on public.cafe_suggestions
  for select using (auth.uid() = user_id);

drop policy if exists cafe_suggestions_insert_own on public.cafe_suggestions;
create policy cafe_suggestions_insert_own on public.cafe_suggestions
  for insert with check (auth.uid() = user_id);

create or replace function public.get_leaderboard(city text default null, limit_n int default 100)
returns table (
  user_id uuid,
  username text,
  display_name text,
  bag_count bigint,
  specialty_count bigint,
  roaster_count bigint,
  rank bigint
)
language sql
security definer
set search_path = public
as $$
  with stats as (
    select
      p.id as user_id,
      p.username,
      p.display_name,
      count(b.id) as bag_count,
      count(b.id) filter (where c.is_specialty) as specialty_count,
      count(b.id) filter (where c.is_specialty or 'roaster' = any(c.tags) or 'roaster' = any(c.trail_tags)) as roaster_count
    from public.profiles p
    join public.bags b on b.user_id = p.id
    join public.cafes c on c.id = b.cafe_id
    where city is null or p.home_city = city
    group by p.id, p.username, p.display_name
    having count(b.id) > 0
  )
  select
    user_id,
    username,
    display_name,
    bag_count,
    specialty_count,
    roaster_count,
    rank() over (order by bag_count desc, specialty_count desc, roaster_count desc) as rank
  from stats
  order by bag_count desc, specialty_count desc, roaster_count desc
  limit limit_n;
$$;

create or replace function public.get_monthly_leaderboard(city text default null, limit_n int default 100)
returns table (
  user_id uuid,
  username text,
  display_name text,
  bag_count bigint,
  specialty_count bigint,
  roaster_count bigint,
  rank bigint
)
language sql
security definer
set search_path = public
as $$
  with stats as (
    select
      p.id as user_id,
      p.username,
      p.display_name,
      count(b.id) as bag_count,
      count(b.id) filter (where c.is_specialty) as specialty_count,
      count(b.id) filter (where c.is_specialty or 'roaster' = any(c.tags) or 'roaster' = any(c.trail_tags)) as roaster_count
    from public.profiles p
    join public.bags b on b.user_id = p.id
    join public.cafes c on c.id = b.cafe_id
    where (city is null or p.home_city = city)
      and b.bagged_at >= date_trunc('month', now())
    group by p.id, p.username, p.display_name
    having count(b.id) > 0
  )
  select
    user_id,
    username,
    display_name,
    bag_count,
    specialty_count,
    roaster_count,
    rank() over (order by bag_count desc, specialty_count desc, roaster_count desc) as rank
  from stats
  order by bag_count desc, specialty_count desc, roaster_count desc
  limit limit_n;
$$;

grant execute on function public.get_leaderboard(text, int) to anon, authenticated;
grant execute on function public.get_monthly_leaderboard(text, int) to anon, authenticated;
