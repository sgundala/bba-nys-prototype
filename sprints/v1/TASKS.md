# Sprint v1 — Tasks

Each task is atomic (~5–10 min for an AI agent), ordered, and testable. The 10-task cap is intentionally lifted for v1 per project decision — we need a full demo, not a foundation.

Priorities: **P0** = must-have for the demo, **P1** = should-have (noticeable polish), **P2** = nice-to-have.

---

- [x] **Task 1: Scaffold Next.js app with TypeScript + Tailwind** (P0)
  - Run `npx create-next-app@latest . --typescript --tailwind --app --eslint --src-dir --import-alias '@/*' --no-turbopack` in the existing directory (answer "yes" to overwrite where needed; preserve `.env`, `.gitignore`, `.env.example`, `CLAUDE.md`, `idea.md`, `src/data/`, `sprints/`).
  - Acceptance: `npm run dev` starts on :3000 and serves the default Next.js page. Tailwind utility classes work (change `page.tsx` background to red to verify, then revert).
  - Files: `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`.

- [x] **Task 2: Install MapLibre, Supabase, shadcn/ui deps** (P0)
  - `npm i maplibre-gl @supabase/supabase-js @supabase/ssr`
  - `npm i -D @types/maplibre-gl`
  - `npx shadcn@latest init` (defaults: Neutral base color, CSS vars yes)
  - `npx shadcn@latest add select button card` for the panels
  - Acceptance: All deps listed in `package.json`. `components/ui/select.tsx`, `components/ui/button.tsx`, `components/ui/card.tsx` exist. No install errors.
  - Files: `package.json`, `package-lock.json`, `components.json`, `src/components/ui/*`, `src/lib/utils.ts`.

- [x] **Task 3: Create species mock data** (P0)
  - Create `src/data/species.ts` exporting `SPECIES: Species[]` and a `Species` type with `id`, `commonName`, `scientificName`.
  - Include exactly 5 entries: American Robin (`amro`, _Turdus migratorius_), Blue Jay (`blja`, _Cyanocitta cristata_), Red-tailed Hawk (`rtha`, _Buteo jamaicensis_), Black-capped Chickadee (`bcch`, _Poecile atricapillus_), Common Yellowthroat (`coye`, _Geothlypis trichas_).
  - Acceptance: File type-checks. `import { SPECIES } from '@/data/species'` resolves and returns an array of 5.
  - Files: `src/data/species.ts`.

- [x] **Task 4: Create breeding-status mock data** (P0)
  - Create `src/data/breeding.ts` exporting `BreedingStatus = 'confirmed' | 'probable' | 'possible' | 'none'` and `BREEDING: Record<speciesId, Record<countyFips, BreedingStatus>>`.
  - Generate values deterministically: use a seeded PRNG (or `(speciesId.charCodeAt(0) + parseInt(fips)) % 4`) so the same county/species pair always gets the same color across page reloads. County FIPS codes come from `ny-counties.geojson` `GEOID` properties (36001–36123 for NY).
  - Acceptance: `BREEDING['amro']['36001']` returns one of the 4 status strings. All 62 NY counties × 5 species = 310 entries per species — or `undefined` falls back to `'none'` in the consumer.
  - Files: `src/data/breeding.ts`.

- [x] **Task 5: Create map base-style definitions** (P0)
  - Create `src/lib/map-styles.ts` exporting three MapLibre `StyleSpecification` objects: `streetsStyle`, `satelliteStyle`, `terrainStyle`.
  - Streets: OSM raster tiles, single tile URL, attribution `© OpenStreetMap contributors`.
  - Satellite: Esri World Imagery raster tiles, **tile URL must use `{z}/{y}/{x}` order** (not `{z}/{x}/{y}`), attribution `Tiles © Esri — Source: Esri, USGS, NOAA`.
  - Terrain: OpenTopoMap, **tiles array with 3 explicit subdomain URLs** (`a.`, `b.`, `c.` — no `{a-c}` or `${s}` shorthand), attribution `© OpenTopoMap contributors, CC-BY-SA`.
  - Each style's `version: 8`, a `raster` source, a single background + raster layer. `minzoom`/`maxzoom` sensible defaults (0–19).
  - Acceptance: `import { streetsStyle } from '@/lib/map-styles'` resolves. Style objects satisfy MapLibre's `StyleSpecification` TS type.
  - Files: `src/lib/map-styles.ts`.

- [x] **Task 6: Stub the Supabase client** (P0)
  - Create `src/lib/supabase.ts` that reads `process.env.NEXT_PUBLIC_SUPABASE_URL` and `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` and calls `createClient(url, anonKey)`, exporting the result as `supabase`.
  - Do NOT call any methods on it anywhere in the codebase.
  - Acceptance: File imports without runtime error when env vars are set. If env vars are missing, fall back to empty strings (client will not be used in v1 anyway).
  - Files: `src/lib/supabase.ts`.

- [x] **Task 7: Build the `Map.tsx` shell** (P0)
  - Create `src/components/Map.tsx`. First line MUST be `'use client'`.
  - Initialize a MapLibre `Map` in a `useEffect` with a ref-bound container div.
  - Start with `streetsStyle`. On init call `map.fitBounds([[-79.76, 40.49], [-71.86, 45.01]], { padding: 20 })`.
  - Add the default `AttributionControl` (bottom-right) and a `NavigationControl`.
  - Props contract (stub for now): `{ selectedSpeciesId, selectedCountyFips, baseMap, layerVisibility, onCountyClick }`.
  - Acceptance: Empty map renders. `npm run dev` → map of NYS loads with OSM streets and zoom controls. No console errors.
  - Files: `src/components/Map.tsx`.

- [x] **Task 8: Add county GeoJSON source + fill/outline layers** (P0)
  - Fetch `/ny-counties.geojson` from the `public/` directory at runtime (or import it directly — pick whichever you prefer; `fetch` is more realistic). Copy/move the file from `src/data/` to `public/ny-counties.geojson` if using fetch.
  - Inside `map.on('style.load', () => { ... })`, `addSource('counties', { type: 'geojson', data, promoteId: 'GEOID' })`, then `addLayer` for fill (id `counties-fill`) and outline (id `counties-outline`).
  - Fill starts with `fill-color: #e0e0e0`, `fill-opacity: 0.6`. Outline is `line-color: #374151`, `line-width: 1`.
  - Acceptance: All 62 NY counties are visible as gray polygons with dark outlines over the OSM base map.
  - Files: `src/components/Map.tsx`, `public/ny-counties.geojson`.

- [x] **Task 9: Data-driven fill color by breeding status** (P0)
  - When `selectedSpeciesId` is set, build a `fill-color` expression that maps each feature's `GEOID` to the correct hex based on `BREEDING[selectedSpeciesId][fips]`. Use MapLibre's `match` expression over a feature-state value (cleanest), or use `case` + `get` over the feature property.
  - Alternative simpler approach: call `map.setFeatureState({ source: 'counties', id: fips }, { status })` for each county on species change, then paint expression reads feature state.
  - Colors: `confirmed → #2d6a4f`, `probable → #74c69d`, `possible → #d8f3dc`, `none → #e0e0e0`.
  - Acceptance: Changing the selected species via a temporary in-code override re-colors the counties within one frame.
  - Files: `src/components/Map.tsx`.

- [x] **Task 10: Hover feature-state (fill-opacity 0.6 → 0.85)** (P0)
  - Add `map.on('mousemove', 'counties-fill', …)` / `mouseleave` handlers that set/clear `{ hover: true }` feature state on the hovered county.
  - Adjust the `fill-opacity` paint property to a `case` expression: `['case', ['boolean', ['feature-state', 'hover'], false], 0.85, 0.6]`.
  - Also set `map.getCanvas().style.cursor = 'pointer'` on enter and reset on leave.
  - Acceptance: Hovering a county visibly darkens it and shows the pointer cursor.
  - Files: `src/components/Map.tsx`.

- [x] **Task 11: County click handler wired to parent** (P0)
  - Add `map.on('click', 'counties-fill', (e) => onCountyClick(e.features[0].properties.GEOID))`.
  - Do NOT open a MapLibre popup. The parent page state will drive the info panel.
  - Acceptance: Clicking a county logs the FIPS to console via the `onCountyClick` prop.
  - Files: `src/components/Map.tsx`.

- [x] **Task 12: Build `SpeciesDropdown` component** (P0)
  - Create `src/components/SpeciesDropdown.tsx` (client component). Use shadcn `Select`. Options are `SPECIES` from mock data.
  - Props: `{ value, onChange }`. Default to the first species's id.
  - Acceptance: Dropdown renders 5 options, common name as label. Selection changes fire `onChange`.
  - Files: `src/components/SpeciesDropdown.tsx`.

- [x] **Task 13: Build `BaseMapToggle` component** (P0)
  - Create `src/components/BaseMapToggle.tsx`. Three shadcn `Button`s (or one segmented control): Streets / Satellite / Terrain.
  - Props: `{ value, onChange }`. Active button gets a distinct style.
  - Acceptance: Clicking a button calls `onChange('streets' | 'satellite' | 'terrain')`.
  - Files: `src/components/BaseMapToggle.tsx`.

- [x] **Task 14: Wire base-map switching in `Map.tsx`** (P0)
  - Add a `useEffect` on `baseMap` prop. Call `map.setStyle(stylesByKey[baseMap])`.
  - Re-add the counties source + fill/outline + hover + click handlers inside a fresh `map.on('style.load', …)` — `setStyle` removes custom sources and layers.
  - Preserve `layerVisibility` and `selectedSpeciesId` coloring after the style swap.
  - Acceptance: Switching base map redraws the basemap AND keeps county overlay intact, correctly colored, still clickable and hoverable.
  - Files: `src/components/Map.tsx`.

- [x] **Task 15: Build `CountyInfoPanel` component** (P0)
  - Create `src/components/CountyInfoPanel.tsx`. Shows an empty state when no county is selected.
  - When a county is selected, show (inside a shadcn `Card`): county name, selected species common + scientific name, a colored badge matching the breeding status fill color, and the atlas period `2020–2024` (static).
  - Props: `{ county: { fips, name } | null, species: Species, status: BreedingStatus }`.
  - Acceptance: Selecting a county on the map shows its name + species info + colored status badge in the left panel.
  - Files: `src/components/CountyInfoPanel.tsx`.

- [x] **Task 16: Build `LayerPanel` component** (P0)
  - Create `src/components/LayerPanel.tsx`. Right side. Two toggles: "County fill" (controls `counties-fill` visibility), "County outline" (controls `counties-outline` visibility).
  - Props: `{ value: { fill: boolean, outline: boolean }, onChange }`.
  - Use shadcn `Card` + native checkboxes (shadcn switch also fine).
  - Acceptance: Toggling either checkbox hides/shows the corresponding layer on the map.
  - Files: `src/components/LayerPanel.tsx`.

- [x] **Task 17: Wire `layerVisibility` into `Map.tsx`** (P0)
  - Add a `useEffect` that calls `map.setLayoutProperty('counties-fill', 'visibility', value.fill ? 'visible' : 'none')` and same for outline.
  - Acceptance: Layer panel toggles take effect immediately on the map.
  - Files: `src/components/Map.tsx`.

- [x] **Task 18: Assemble everything in `page.tsx`** (P0)
  - Replace default Next.js template. `'use client'` at top. Hold all state (`selectedSpeciesId`, `selectedCountyFips`, `baseMap`, `layerVisibility`).
  - Layout: CSS grid or flexbox — fixed-width left panel (`CountyInfoPanel` with `SpeciesDropdown` stacked above it), center column for `BaseMapToggle` (top) + `Map` (fills remaining space), fixed-width right panel (`LayerPanel`).
  - Full viewport height (`h-screen`). Professional look: neutral background, subtle borders, clean typography.
  - Compute the selected `county` object (name + fips) by looking up `selectedCountyFips` in the GeoJSON features (loaded once on mount).
  - Acceptance: The full demo is visible and functional in one screen: species dropdown drives county colors, base-map toggle swaps tiles without losing the overlay, clicking a county populates the left panel, layer-panel toggles hide/show layers.
  - Files: `src/app/page.tsx`.

- [x] **Task 19: Polish layout with Tailwind + shadcn** (P1)
  - Add a thin app header with the title "NYS Breeding Bird Atlas — Prototype" and a "Polymorph-Associates, Albany NY" subtitle.
  - Consistent padding, rounded corners on cards, subtle shadows. Ensure MapLibre canvas has no weird overflow.
  - Sans-serif body font (default Inter from `next/font` is fine).
  - Acceptance: Visual check: looks like a professional demo, not a wireframe.
  - Files: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`.

- [x] **Task 20: Write a minimal `README.md`** (P1)
  - Include: project description (one paragraph), setup (`npm i`, copy `.env.example` to `.env`, `npm run dev`), the 5 species list, the 3 base maps, and the demo URL (to be filled after deploy).
  - Mention that v1 uses all mock data and the Supabase client is a stub.
  - Acceptance: A fresh cloner can `npm i && npm run dev` and reach a working map by following README alone.
  - Files: `README.md`.

- [ ] **Task 21: Deploy to Vercel** (P0)
  - In the Vercel dashboard, import the GitHub repo `sgundala/bba-nys-prototype`. Framework preset auto-detects Next.js.
  - Add env vars in Vercel (Production + Preview): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Leave `SUPABASE_SERVICE_ROLE_KEY` unset (not needed — stub only).
  - Trigger first deploy. Verify build succeeds.
  - Paste the production URL into `README.md`.
  - Acceptance: Public HTTPS URL on `*.vercel.app` shows the working demo. Every push to `main` triggers an auto-deploy.
  - Files: `README.md` (URL update), Vercel project config (dashboard).

- [ ] **Task 22: Smoke-test the deployed demo** (P0)
  - Open the Vercel URL in a fresh browser. Verify, in order: map loads → OSM tiles render → 62 counties visible and gray by default → pick a species → counties recolor → hover a county → opacity rises → click county → info panel on the left fills in → switch to Satellite → Esri imagery loads, overlay preserved → switch to Terrain → OpenTopoMap loads, overlay preserved → toggle "County fill" off → polygons disappear, outlines remain → toggle back on. No console errors at any step.
  - Acceptance: Every item above passes on the deployed URL, not just locally. File any failures as follow-up tasks.
  - Files: none (verification only).
