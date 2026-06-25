# JibJib — Ubon Coffee Passport

A mobile-first Next.js + Supabase PWA for collecting Ubon Ratchathani cafes.

This build uses **OpenStreetMap embed + custom app pins**. There is **no Google Maps API key, no Google Places key, and no paid map billing requirement** for v1.

The product loop is still the same: **sip, GPS-check-in, collect stamps, climb the board, share the card**.

## What is included

- Email + password login/sign-up with Supabase.
- Magic-link login is still available as a secondary option, but password login avoids Supabase OTP email rate limits while testing.
- Thai / English language toggle.
- Ubon cafe dex with list + OpenStreetMap field map.
- Zero-paid-map setup: OSM embed plus JibJib custom marker overlay.
- GPS-verified cafe bagging within a configurable radius.
- Rich cafe detail pages: best drink, beans, best time, laptop vibe, parking, price, date spot, serious-coffee score, photo score.
- Coffee identity home screen: tier, rank, trails, next stamp, recent bags.
- Achievement trails: roasters, slow bars, laptop-safe cafes, date spots, classics.
- All-time and monthly leaderboards.
- Viral-style share card with rank, tier, specialty count, roasters, slow bars, last bag, unlocked badges.
- Cafe suggestion page so early users can help fill the dex.
- Supabase RLS policies and aggregate RPC functions.
- Manual seed script using `supabase/seed-cafes.json` lat/lng. No external geocoding calls.
- JibJib SVG brand system: `จิบๆ / COFFEE PASSPORT`.

## Stack

- Next.js 14 app router
- React 18
- Tailwind CSS
- Supabase Auth + Postgres + RLS
- OpenStreetMap embed for the map background
- Custom React/SVG/HTML overlay pins for bagged/unbagged cafes
- `html-to-image` for downloadable share cards

## Environment variables

Only these are needed for live deployment:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_BAG_RADIUS_M=200
```

Only this one is needed locally if you run `npm run seed`:

```bash
SUPABASE_SERVICE_ROLE_KEY=...
```

There are no Google Maps or Places env vars in this build.

## Supabase setup

For a fresh database, run this in Supabase SQL Editor:

```sql
supabase/migrations/0001_init.sql
```

If you already ran the original older schema, run the upgrade instead:

```sql
supabase/migrations/0002_cafedex_upgrade.sql
```

Then enable Email auth in Supabase Auth and add your local/Vercel URLs to **Authentication → URL Configuration**.

For easiest testing, go to **Authentication → Providers → Email** and keep email/password enabled. If you want sign-up to log in immediately without another email, turn **Confirm email** off while testing. Turn confirmation back on before a serious public launch if you want verified emails.

Typical URLs:

```text
http://localhost:3000/auth/callback
https://YOUR-VERCEL-DOMAIN.vercel.app/auth/callback
```

## Seeding cafes

The seed script reads `supabase/seed-cafes.json` and upserts rows through the Supabase service role key.

It does **not** call Google Places. Every seed row must already have manual `lat` and `lng`.

Run:

```bash
npm run seed
```

Important: the seed data is a launch scaffold. Before a public push, manually verify every cafe pin and detail in Ubon, then set `local_verified=true` for checked listings.

## Development checks

```bash
npm run typecheck
npm run lint
npm run build
```

Use Node 22 on Vercel. If npm/pnpm install fails on Vercel, use Yarn classic:

```bash
yarn install --ignore-engines --network-timeout 600000
yarn build
```

If your laptop has bad internet, skip local installs/builds and let Vercel build from GitHub.

## Map notes

The map screen uses an OpenStreetMap embed plus a custom overlay for the app pins.

Why this choice:

- no billing account required
- no Google Maps API key
- no Places API dependency
- no paid map surprise if people open it
- enough for a curated Ubon v1 with 20-50 manually verified cafes

For a public app with heavy traffic, consider a dedicated tile provider later. V1 should be kept simple and low-risk.

## Product direction

Do not turn this into a generic review app.

The moat is:

1. **Your record** — a collection people do not want to lose.
2. **Status** — rank, tier, badges, trails.
3. **Local taste** — best drink, vibe, laptop/date/serious-coffee data generic maps do not structure well.
4. **Share object** — the JibJib card must look good enough to repost.

The UI sells the idea. The app only becomes truly good after the Ubon data is real: verified pins, real Thai names, best drinks, photos, and local field notes.
