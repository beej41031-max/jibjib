-- Cafedex schema, security, and functions.
-- Run this in the Supabase SQL editor for a fresh install.
-- If you already deployed the older v1, run 0002_cafedex_upgrade.sql after this file's older version.

create extension if not exists pgcrypto;

-- ---------- Tables ----------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  home_city text default 'Ubon Ratchathani',
  created_at timestamptz default now()
);

create table if not exists public.cafes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_th text,
  area text,
  area_th text,
  address text,
  lat double precision not null,
  lng double precision not null,
  google_place_id text unique,
  photo_url text,
  rating numeric,
  tags text[] not null default '{}',
  trail_tags text[] not null default '{}',
  is_specialty boolean not null default false,
  best_drink text,
  best_drink_th text,
  best_time text,
  best_time_th text,
  why_go text,
  why_go_th text,
  beans_note text,
  beans_note_th text,
  laptop_vibe text check (laptop_vibe in ('yes', 'okay', 'no') or laptop_vibe is null),
  has_sockets boolean,
  parking text,
  parking_th text,
  date_spot boolean,
  price_band text check (price_band in ('฿', '฿฿', '฿฿฿') or price_band is null),
  quiet_level text check (quiet_level in ('calm', 'mixed', 'busy') or quiet_level is null),
  serious_score int check (serious_score between 1 and 5 or serious_score is null),
  photo_score int check (photo_score between 1 and 5 or photo_score is null),
  local_verified boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.bags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cafe_id uuid not null references public.cafes(id) on delete cascade,
  bagged_at timestamptz not null default now(),
  lat double precision,
  lng double precision,
  note text,
  drink text,
  brew_method text,
  verified boolean not null default false,
  unique (user_id, cafe_id)
);

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

create index if not exists bags_user_idx on public.bags(user_id);
create index if not exists bags_cafe_idx on public.bags(cafe_id);
create index if not exists bags_bagged_at_idx on public.bags(bagged_at desc);
create index if not exists cafes_tags_idx on public.cafes using gin(tags);
create index if not exists cafes_trail_tags_idx on public.cafes using gin(trail_tags);
create index if not exists cafe_suggestions_user_idx on public.cafe_suggestions(user_id);

-- ---------- Row Level Security ----------

alter table public.profiles enable row level security;
alter table public.cafes enable row level security;
alter table public.bags enable row level security;
alter table public.cafe_suggestions enable row level security;

-- profiles: world-readable (names appear on the leaderboard); user edits own row
drop policy if exists profiles_select_all on public.profiles;
create policy profiles_select_all on public.profiles for select using (true);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = id);

-- cafes: world-readable; writes only via service role (no public write policies)
drop policy if exists cafes_select_all on public.cafes;
create policy cafes_select_all on public.cafes for select using (true);

-- bags: owner-only. Aggregates are exposed through security-definer functions below.
drop policy if exists bags_select_own on public.bags;
create policy bags_select_own on public.bags for select using (auth.uid() = user_id);

drop policy if exists bags_insert_own on public.bags;
create policy bags_insert_own on public.bags for insert with check (auth.uid() = user_id);

drop policy if exists bags_update_own on public.bags;
create policy bags_update_own on public.bags for update using (auth.uid() = user_id);

drop policy if exists bags_delete_own on public.bags;
create policy bags_delete_own on public.bags for delete using (auth.uid() = user_id);

-- Suggestions: users can create/read their own. Admin/service role reviews directly.
drop policy if exists cafe_suggestions_select_own on public.cafe_suggestions;
create policy cafe_suggestions_select_own on public.cafe_suggestions
  for select using (auth.uid() = user_id);

drop policy if exists cafe_suggestions_insert_own on public.cafe_suggestions;
create policy cafe_suggestions_insert_own on public.cafe_suggestions
  for insert with check (auth.uid() = user_id);

-- ---------- Auto-create a profile on signup ----------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    'cafe_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8),
    coalesce(nullif(split_part(new.email, '@', 1), ''), 'bagger')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Aggregate functions (run past RLS, expose only public counts) ----------

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

create or replace function public.get_cafe_baggers(cafe uuid)
returns integer
language sql
security definer
set search_path = public
as $$
  select count(*)::int from public.bags where cafe_id = cafe;
$$;

grant execute on function public.get_leaderboard(text, int) to anon, authenticated;
grant execute on function public.get_monthly_leaderboard(text, int) to anon, authenticated;
grant execute on function public.get_cafe_baggers(uuid) to anon, authenticated;
