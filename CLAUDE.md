# BBA NYS Prototype

Prototype web app for exploring New York State Breeding Bird Atlas (BBA) data on an interactive map.
Built by **Polymorph-Associates Inc., Albany, NY** as a live demo to support the SUNY ESF / Research Foundation RFP bid.

---

## Goal

Next.js + MapLibre GL JS app that lets a user:
- View a map centered on New York State
- Toggle between base maps: streets, satellite, terrain (free tile sources only — no API keys)
- See NYS county boundaries colored by breeding status for the selected species
- Pick a bird species from a dropdown (5 species mock list)
- Click a county to update a left-side info panel with mock breeding-status data
- Toggle data layer visibility from a right-side panel

Styling: Tailwind CSS. Clean, modern, professional look suitable for a bid demo.

---

## Tech Stack

### Prototype (what we are building now — 100% free, no paid services)

| Layer | Technology | Cost |
|-------|-----------|------|
| Framework | Next.js 14+ (App Router, TypeScript) | Free |
| Map Engine | MapLibre GL JS | Free / open-source |
| Styling | Tailwind CSS + shadcn/ui | Free / open-source |
| Data | Local GeoJSON + hardcoded mock `.ts` files | Free |
| Database | Supabase Free tier (PostgreSQL + PostGIS) | Free |
| Auth | Supabase Auth (stubbed — not called in prototype) | Free |
| Storage | Supabase Storage (stubbed) | Free |
| Hosting | Vercel Hobby (free tier) | Free |
| Base map tiles | OSM / Esri / OpenTopoMap (free, attribution required) | Free |
| CI/CD | GitHub Actions (free for public repos) | Free |

**Total prototype cost: $0**

### Production Stack (what Polymorph-Associates proposes in the bid)

This is documented here so the prototype is built on the same foundations — no rewrites needed when the real data layer lands.

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 14+ (App Router, TypeScript) | Same as prototype |
| Map Engine | MapLibre GL JS | Linux Foundation governed, no license fees, used by Swiss Bird Atlas |
| Styling | Tailwind CSS + shadcn/ui | Any frontend dev can maintain |
| CMS | Directus (self-hosted on Fly.io) | SUNY staff edits content without dev help |
| Database | Supabase Pro (PostgreSQL 16 + PostGIS) | $25/mo — managed, backups, RLS, REST API |
| Auth | Supabase Auth | JWT, RLS, data use agreement tracking |
| Storage | Supabase Storage | Photos, figures, PMTiles archives, COGs |
| API | Supabase REST + Next.js API Routes | No separate API server needed |
| Vector Tiles | PMTiles (served from Supabase Storage) | Single-file archive, no tile server to manage |
| Raster Tiles | TiTiler on Fly.io | COG serving for occupancy/density maps, ~$7/mo |
| Spatial Queries | PostGIS | County/block/polygon queries |
| Point Clustering | Supercluster (client-side) | Handles 145K+ observation points smoothly |
| Data Ingestion | Python + GeoPandas + GDAL | CSV/GeoTIFF → PostGIS pipelines |
| Taxonomy Sync | Python script (annual) | AviList diff → synonyms table |
| Hosting | Vercel Pro | $20/mo — global CDN, preview deploys |
| IaC | Terraform | Full infra as code — reproducible in 2044 |
| CI/CD | GitHub Actions | Build, test, lint, accessibility, deploy |
| Monitoring | Sentry + Vercel Analytics | Error tracking, uptime |
| Security | Supabase RLS + Vercel DDoS + Dependabot | Row-level security, edge protection, dep scanning |

**Production infrastructure cost: ~$55/month (~$660/year)**
**Total annual maintenance bid: ~$11,760/year (infra + engineering + support)**

---

## Free Tile Sources (prototype — no API key required)

- **Streets:** OpenStreetMap raster tiles:
  ```
  https://tile.openstreetmap.org/{z}/{x}/{y}.png
  ```
  Attribution: `© OpenStreetMap contributors`

- **Satellite:** Esri World Imagery — note `{z}/{y}/{x}` order (y before x, different from OSM):
  ```
  https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}
  ```
  Attribution: `Tiles © Esri — Source: Esri, USGS, NOAA`

- **Terrain:** OpenTopoMap — pass as a `tiles` array with 3 explicit subdomain URLs.
  Do NOT use `${s}` or `{a-c}` shorthand — MapLibre requires plain URL strings:
  ```json
  [
    "https://a.tile.opentopomap.org/{z}/{x}/{y}.png",
    "https://b.tile.opentopomap.org/{z}/{x}/{y}.png",
    "https://c.tile.opentopomap.org/{z}/{x}/{y}.png"
  ]
  ```
  Attribution: `© OpenTopoMap contributors, CC-BY-SA`

All attributions must be visible on the map at all times per each provider's terms.

---

## Map Behavior Specifics

### Critical: `'use client'` directive
`Map.tsx` MUST have `'use client'` as its absolute first line — MapLibre requires browser APIs
(`window`, `document`) and will throw a hard error during Next.js SSR without it.
Any component that imports `Map.tsx` must also be a client component.

### Critical: `style.load` guard
ALL `map.addSource()` and `map.addLayer()` calls MUST be wrapped inside:
```ts
map.on('style.load', () => {
  // add sources and layers here
})
```
Never call `addSource` or `addLayer` outside this handler — it causes race conditions
when the map style has not finished loading, especially on base map switches.

### Initial view
On map init call:
```ts
map.fitBounds([[-79.76, 40.49], [-71.86, 45.01]], { padding: 20 })
```
This frames all of New York State correctly.

### County fill colors (by breeding status)
```ts
confirmed → #2d6a4f   // dark green  — standard atlas convention
probable  → #74c69d   // medium green
possible  → #d8f3dc   // light green
none      → #e0e0e0   // gray
```
The fill color updates immediately when the user changes the selected species.

### Hover behavior
Raise `fill-opacity` from `0.6` → `0.85` on the hovered county using MapLibre feature state:
```ts
map.setFeatureState({ source: 'counties', id: hoveredId }, { hover: true })
```

### Click behavior — NO MapLibre popup
Do NOT use a MapLibre popup overlay (`new maplibregl.Popup()`).
On county click, update the `CountyInfoPanel` React component (left side) showing:
- County name
- Selected species common name + scientific name
- Breeding status (colored badge matching the fill color)
- Atlas period: `"2020–2024"` (mock)

### Base map switching
When the user switches base map:
1. Call `map.setStyle(newStyleObject)`
2. Re-add the county GeoJSON source and fill/outline layers inside the new `map.on('style.load', ...)` event
3. Re-apply the current species color expression to the new layer

### Supabase — stub only in prototype
Initialize the Supabase client in `src/lib/supabase.ts` using env vars.
Do NOT call any Supabase methods anywhere in the prototype.
All data comes from local mock files. The file exists so wiring real queries later
requires no restructuring — just import `supabase` and write the query.

---

## Project Layout

```
src/
  app/
    layout.tsx              # root layout, Tailwind font setup
    page.tsx                # map page — assembles all panels
    globals.css             # Tailwind entry point
  components/
    Map.tsx                 # MapLibre GL JS container ('use client' — REQUIRED)
    BaseMapToggle.tsx       # streets / satellite / terrain switcher
    SpeciesDropdown.tsx     # 5-species selector
    LayerPanel.tsx          # right-side layer visibility toggles
    CountyInfoPanel.tsx     # left-side info panel (NOT a MapLibre popup)
  data/
    ny-counties.geojson     # NYS county boundaries — download instructions below
    species.ts              # 5-species list with types
    breeding.ts             # mock breeding status keyed by (speciesId, countyFips)
  lib/
    map-styles.ts           # base-map tile source definitions for MapLibre
    supabase.ts             # Supabase client stub (initialized, never called)
public/
.env.local                  # git-ignored — Supabase keys go here
```

### Page layout (desktop — left panel / map / right panel)
```
┌─────────────────────────────────────────────────────────┐
│  Header: "NY Breeding Bird Atlas"  +  species dropdown  │
├──────────────┬────────────────────────────┬─────────────┤
│ CountyInfo   │                            │  Layer      │
│ Panel        │     MapLibre GL Map        │  Panel      │
│ (240px)      │     (fills remaining)      │  (200px)    │
│              │                            │             │
│ county name  │                            │ ☑ Counties  │
│ species      │                            │ ☑ Blocks    │
│ status badge │                            │ ☑ Labels    │
│ atlas period │                            │             │
├──────────────┴────────────────────────────┴─────────────┤
│  Base map toggle: [Streets] [Satellite] [Terrain]       │
│  Attribution text (required by tile providers)          │
└─────────────────────────────────────────────────────────┘
```

---

## Mock Data — Copy Exactly As Written

Do not invent FIPS codes or species IDs. Use these exact values.

```ts
// src/data/species.ts
export const SPECIES = [
  { id: 'amro', commonName: 'American Robin',          sciName: 'Turdus migratorius'   },
  { id: 'eabl', commonName: 'Eastern Bluebird',        sciName: 'Sialia sialis'         },
  { id: 'baww', commonName: 'Black-and-white Warbler', sciName: 'Mniotilta varia'       },
  { id: 'witu', commonName: 'Wild Turkey',             sciName: 'Meleagris gallopavo'   },
  { id: 'ospr', commonName: 'Osprey',                  sciName: 'Pandion haliaetus'     },
] as const;

export type SpeciesId = typeof SPECIES[number]['id'];
export type Status = 'confirmed' | 'probable' | 'possible' | 'none';
```

```ts
// src/data/breeding.ts
// FIPS codes match the ny-counties.geojson feature properties exactly.
// Counties not listed default to 'none' (gray fill) at runtime.
import type { SpeciesId, Status } from './species';

export const BREEDING: Record<SpeciesId, Record<string, Status>> = {
  amro: {
    '36001': 'confirmed', '36005': 'confirmed', '36029': 'probable',
    '36047': 'confirmed', '36055': 'probable',  '36059': 'confirmed',
    '36061': 'confirmed', '36063': 'possible',  '36067': 'probable',
    '36081': 'confirmed', '36103': 'confirmed', '36119': 'confirmed',
  },
  eabl: {
    '36001': 'probable',  '36005': 'none',      '36029': 'confirmed',
    '36047': 'none',      '36055': 'confirmed', '36059': 'possible',
    '36061': 'none',      '36063': 'confirmed', '36067': 'probable',
    '36081': 'none',      '36103': 'possible',  '36119': 'probable',
  },
  baww: {
    '36001': 'possible',  '36005': 'none',      '36029': 'probable',
    '36047': 'none',      '36055': 'possible',  '36059': 'none',
    '36061': 'none',      '36063': 'probable',  '36067': 'possible',
    '36081': 'none',      '36103': 'possible',  '36119': 'none',
  },
  witu: {
    '36001': 'confirmed', '36005': 'none',      '36029': 'confirmed',
    '36047': 'none',      '36055': 'confirmed', '36059': 'none',
    '36061': 'none',      '36063': 'confirmed', '36067': 'confirmed',
    '36081': 'none',      '36103': 'probable',  '36119': 'possible',
  },
  ospr: {
    '36001': 'possible',  '36005': 'none',      '36029': 'possible',
    '36047': 'none',      '36055': 'none',      '36059': 'confirmed',
    '36061': 'none',      '36063': 'none',      '36067': 'possible',
    '36081': 'none',      '36103': 'confirmed', '36119': 'possible',
  },
};
```

### County FIPS reference
```
36001 Albany        36047 Kings (Brooklyn)   36067 Onondaga
36005 Bronx         36055 Monroe             36081 Queens
36029 Erie          36059 Nassau             36103 Suffolk
36061 New York      36063 Niagara            36119 Westchester
```

---

## GeoJSON Data

Download the NYS county boundaries GeoJSON and save to `src/data/ny-counties.geojson`:
```
https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/new-york-counties.geojson
```
- Pre-clipped to NYS only (~60 KB)
- Each feature has a `FIPS` property matching the keys in `breeding.ts`
- No processing needed — drop straight into the data folder

---

## Supabase Setup (free tier — no payment required)

1. Create a free project at supabase.com
2. Copy your project URL and anon key into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
3. The client is initialized in `src/lib/supabase.ts` but never called in the prototype
4. Enable PostGIS in Supabase dashboard → Database → Extensions → PostGIS (for future use)
5. Row Level Security: on — no policies needed yet for the stub prototype

Future production tables (do not create now):
```sql
-- species       (id, common_name, sci_name, avilist_id, sensitive_flag, taxonomic_order)
-- counties      (fips, name, geom)            -- PostGIS geometry column
-- breeding_status (species_id, county_fips, status, atlas_year)
-- data_users    (id, email, signed_dua_at)
-- synonyms      (old_name, new_name, avilist_year)
```

---

## Vercel Setup (free hobby tier — no payment required)

1. Push the repo to GitHub (public or private)
2. Go to vercel.com → New Project → import the GitHub repo
3. Add the three Supabase env vars in Vercel → Project Settings → Environment Variables
4. Every push to `main` auto-deploys to production URL
5. Every pull request gets a unique preview URL — use this link in the bid proposal
6. No custom build config needed — Next.js defaults work out of the box

---

## Conventions

- TypeScript strict mode (`"strict": true` in tsconfig) — no `any` types
- Functional React components and hooks only — no class components
- `Map.tsx` MUST be `'use client'` as its absolute first line
- All MapLibre imperative logic stays inside `Map.tsx` only
- Other components communicate with `Map.tsx` via props or a small `MapContext`
- Tailwind utility classes only — custom CSS only for MapLibre canvas height override
- `.env.local` is git-ignored — never commit Supabase keys
- All `addSource` / `addLayer` calls inside `map.on('style.load', callback)` — never outside
- Define proper TypeScript interfaces for all GeoJSON feature properties

---

## Out of Scope (Prototype)

- Real eBird / BBA observation data ingestion
- User accounts, authentication flows, or data use agreements
- Species search beyond the 5-item dropdown
- Mobile layout (desktop-first only)
- Any Supabase API calls (stub client only)
- Raster tile layers (occupancy / density maps — production only)
- PMTiles vector tile serving (production only)
- Export to CSV / GeoPDF / GeoTIFF (production only)
- Sensitive species data obscuration (production only)
- Directus CMS (production only)
- Terraform / IaC (production only)
