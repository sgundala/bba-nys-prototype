# Sprint v1 — PRD

## Sprint Overview

Ship a working, deployed-to-Vercel prototype of the NYS Breeding Bird Atlas map viewer. A user lands on the page, sees a county-level map of New York State colored by the breeding status of a selected bird species, can switch base maps, click a county to see details, and toggle layer visibility. All data is mock/local; no real API calls.

## Goals

- Working Next.js app deployed publicly on Vercel (free tier)
- MapLibre GL JS map centered on NYS with all 62 counties outlined and interactive
- Three working base maps (OSM streets, Esri satellite, OpenTopoMap terrain) with full attribution
- Species dropdown (5 mock NYS breeders) drives per-county fill colors in real time
- County click updates a left-side info panel (NOT a MapLibre popup) with mock breeding data
- Right-side layer-visibility panel toggles the county overlay and its outline independently
- Supabase client file exists and initializes from env vars but is never called (stub for v2)

## User Stories

- **As a SUNY ESF reviewer**, I want to open a URL and immediately see a map of NYS with county boundaries, so that I can evaluate the prototype without setup.
- **As a biologist**, I want to pick a species from a dropdown, so that I can see its breeding distribution across the state at a glance.
- **As a biologist**, I want to click a county, so that I can read the exact breeding status and species details without hunting through a popup.
- **As a user**, I want to toggle between streets, satellite, and terrain base maps, so that I can read county boundaries against context relevant to the question I'm asking.
- **As a user**, I want to hide or show the county layer, so that I can inspect the underlying terrain without visual clutter.
- **As the Polymorph-Associates engineer**, I want the Supabase client already wired to env vars, so that I can swap mock data for real queries in v2 without restructuring.

## Technical Architecture

### Tech stack (v1 only — 100% free)

- **Framework:** Next.js 14+ (App Router, TypeScript, strict mode)
- **Map:** MapLibre GL JS (no API key)
- **Styling:** Tailwind CSS + shadcn/ui for buttons, selects, panels
- **Data:** Local GeoJSON (`src/data/ny-counties.geojson`, already present) + hardcoded `.ts` files for species + breeding status
- **DB client:** `@supabase/supabase-js` — initialized as a stub only
- **Hosting:** Vercel Hobby tier (auto-deploy on push to `main`)
- **Tile sources:** OpenStreetMap, Esri World Imagery, OpenTopoMap (free, attribution required)

### Component tree

```
app/
  layout.tsx
  page.tsx  ─────────────────────────────┐
                                          │
┌─────────────────────────────────────────┴─────────────────────────────┐
│  page.tsx layout (3-region grid)                                       │
│                                                                         │
│  ┌────────────────┐ ┌───────────────────────────┐ ┌──────────────────┐ │
│  │ CountyInfoPanel│ │         Map.tsx           │ │  LayerPanel      │ │
│  │   (left)       │ │      ('use client')       │ │   (right)        │ │
│  │                │ │                           │ │                  │ │
│  │ county name    │ │  MapLibre GL canvas       │ │  [x] Counties    │ │
│  │ species        │ │  + sources/layers         │ │  [x] Outlines    │ │
│  │ status badge   │ │  + hover feature state    │ │                  │ │
│  │ atlas period   │ │  + click → setSelected    │ │                  │ │
│  └────────────────┘ └───────────────────────────┘ └──────────────────┘ │
│        ▲                    ▲           ▲                ▲              │
│        │                    │           │                │              │
│  ┌─────┴──────┐    ┌────────┴─────┐     │          ┌─────┴──────┐       │
│  │ SpeciesDrop│    │BaseMapToggle │     │          │  shared    │       │
│  │  (top-left)│    │   (top-bar)  │     │          │  state     │       │
│  └────────────┘    └──────────────┘     │          └────────────┘       │
└─────────────────────────────────────────┴─────────────────────────────┘
```

### State & data flow

- Page-level React state (useState in `page.tsx`) holds: `selectedSpeciesId`, `selectedCountyFips`, `baseMap`, `layerVisibility`.
- `Map.tsx` receives these as props and reacts:
  - `selectedSpeciesId` change → update `fill-color` paint expression via `map.setPaintProperty`
  - `baseMap` change → `map.setStyle` + re-add sources/layers inside `style.load`
  - `layerVisibility` change → `map.setLayoutProperty(id, 'visibility', ...)`
- County click inside `Map.tsx` → calls `onCountyClick(fips)` prop → page sets `selectedCountyFips` → `CountyInfoPanel` re-renders.
- Breeding status lookup: `BREEDING[speciesId][countyFips]` → string ∈ `confirmed | probable | possible | none`.

### Data files

- `src/data/ny-counties.geojson` — already present, 62 NY counties with `NAME` and `GEOID` (FIPS) properties
- `src/data/species.ts` — 5 species: American Robin, Blue Jay, Red-tailed Hawk, Black-capped Chickadee, Common Yellowthroat
- `src/data/breeding.ts` — random-but-seeded mock status for each (species, county) pair so colors are stable across reloads

## Out of Scope (v1)

- Real eBird / NYS BBA data ingestion
- Any Supabase queries (client is a wired stub only)
- Auth, user accounts, data-use agreements
- PMTiles, vector tiles, raster tiles (COG/TiTiler)
- Species search or filtering beyond a 5-item dropdown
- Mobile layout (desktop-first; responsiveness is v2+)
- Accessibility audit, i18n, analytics, Sentry
- Tests (unit, e2e, visual) — deferred to v2
- Directus CMS, Terraform, GitHub Actions CI beyond Vercel's built-in deploy

## Dependencies

- **Exists:** CLAUDE.md (scope + conventions), `.gitignore`, `.env.example`, `src/data/ny-counties.geojson`, GitHub repo `sgundala/bba-nys-prototype` (public), `.env` with a Supabase project URL + keys (local only).
- **Need before deploy:** Vercel account connected to the GitHub repo; Supabase URL + anon key set in Vercel env vars.
- **Key rotation note:** the service_role key was briefly leaked on a prior commit. User is rotating it separately — v1 does not block on this since the client never calls Supabase.
