# NYS Breeding Bird Atlas — Prototype

Prototype map viewer for the New York State Breeding Bird Atlas. Built by
**Polymorph-Associates Inc., Albany NY** as a live demo to support the
SUNY ESF / Research Foundation RFP bid.

All data in v1 is **mock**. The Supabase client is initialized but never
called — it is a stub that v2 will replace with real queries.

**Live demo:** _TBD once deployed to Vercel_

## Features

- Map of New York State with all 62 counties outlined and interactive
- Three free base maps: **Streets** (OpenStreetMap), **Satellite** (Esri World
  Imagery), **Terrain** (OpenTopoMap)
- Five mock species: American Robin, Blue Jay, Red-tailed Hawk, Black-capped
  Chickadee, Common Yellowthroat
- County fill colors driven by breeding status for the selected species
  (confirmed / probable / possible / not observed)
- Click a county → left-side info panel updates with county, species, status,
  and atlas period (no MapLibre popup)
- Right-side layer panel to hide/show county fill and outline independently,
  plus a legend

## Local setup

```bash
# 1. Install deps
npm install

# 2. Set env vars
cp .env.example .env
# Fill in your Supabase project URL and anon key (the client is stubbed, but
# these must be defined for the module to initialize without throwing).

# 3. Run dev server
npm run dev
# → http://localhost:3000
```

## Tech stack

- **Framework:** Next.js 14 (App Router, TypeScript strict)
- **Map:** MapLibre GL JS
- **Styling:** Tailwind CSS + shadcn/ui primitives
- **Data:** local GeoJSON (`public/ny-counties.geojson`) + hardcoded TS mocks
- **DB client:** `@supabase/supabase-js` (stub only)
- **Hosting:** Vercel (free tier)

## Project layout

```
public/
  ny-counties.geojson       # 62 NYS county polygons (served at /ny-counties.geojson)
src/
  app/                      # Next.js App Router
    layout.tsx, page.tsx, globals.css
  components/
    Map.tsx                 # MapLibre container ('use client' required)
    SpeciesDropdown.tsx
    BaseMapToggle.tsx
    CountyInfoPanel.tsx     # left-side info (NOT a MapLibre popup)
    LayerPanel.tsx          # right-side layer + legend
    ui/                     # shadcn primitives (button, card, select)
  data/
    species.ts              # 5 mock species
    breeding.ts             # deterministic (speciesId, geoid) → status
  lib/
    map-styles.ts           # 3 base-map style definitions
    supabase.ts             # stub client
    colors.ts               # breeding-status → hex + labels
    utils.ts                # cn() helper
sprints/v1/                 # PRD + tasks for this sprint
CLAUDE.md                   # scope, conventions, constraints
```

## What's NOT in v1

- Any real bird-atlas data (no eBird, no NYS BBA)
- Supabase queries (client is a wired stub)
- Auth, accounts, data-use agreements
- Mobile layout, accessibility audit, i18n
- Tests — unit/e2e/visual deferred to v2

See `sprints/v1/PRD.md` for the full scope definition.
