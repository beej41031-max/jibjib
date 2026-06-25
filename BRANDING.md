# JibJib SVG brand system

Primary Thai mark: `จิบๆ` — using Thai repeat grammar mark `ๆ`.

English subheader: `COFFEE PASSPORT`.

Files:

- `src/components/JibJibLogo.tsx` — React SVG component with `full`, `word`, and `mark` variants.
- `public/brand/jibjib-logo.svg` — standalone full SVG wordmark.
- `public/brand/jibjib-mark.svg` — standalone app/icon SVG mark.
- `src/app/icon.svg` — Next app icon.

Usage:

```tsx
import { JibJibLogo } from "@/components/JibJibLogo";

<JibJibLogo className="w-64" />
<JibJibLogo variant="mark" className="h-10 w-10" />
<JibJibLogo variant="word" className="h-9 w-32" />
<JibJibLogo dark className="w-64" />
```

Design intent: Thai-first, coffee-specific, app-ready, not raster/logo-generator slop.

## Current logo direction

This build uses the second-pass `จิบๆ` SVG identity:

- `public/brand/jibjib-logo.svg` — full dark passport-card logo
- `public/brand/jibjib-mark.svg` — compact app mark
- `src/components/JibJibLogo.tsx` — reusable React SVG component used in header, login, and share card

The visual idea is Thai-first: `จิบ` is the base word, while the repetition grammar mark `ๆ` becomes the neon flex/check-in symbol. This is intentionally less traditional café branding and more app/streetwear/stamp identity.
