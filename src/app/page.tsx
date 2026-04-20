"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { SPECIES, speciesById } from "@/data/species";
import { getBreedingStatus, type BreedingStatus } from "@/data/breeding";
import { SpeciesDropdown } from "@/components/SpeciesDropdown";
import { BaseMapToggle } from "@/components/BaseMapToggle";
import { CountyInfoPanel } from "@/components/CountyInfoPanel";
import { LayerPanel } from "@/components/LayerPanel";
import type { LayerVisibility } from "@/components/Map";
import type { BaseMapKey } from "@/lib/map-styles";

// MapLibre needs window/document — load Map.tsx client-only, no SSR.
const Map = dynamic(() => import("@/components/Map").then((m) => m.Map), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">
      Loading map…
    </div>
  ),
});

export default function HomePage() {
  const [speciesId, setSpeciesId] = React.useState<string>("ospr");
  const [speciesSearch, setSpeciesSearch] = React.useState<string>("");
  const [selected, setSelected] = React.useState<{ geoid: string; name: string } | null>(null);
  const [baseMap, setBaseMap] = React.useState<BaseMapKey>("streets");
  const [layerVisibility, setLayerVisibility] = React.useState<LayerVisibility>({
    fill: true,
    outline: true,
    atlasBlocks: false,
  });

  const species = speciesById(speciesId) ?? SPECIES[0];
  const status: BreedingStatus | null = selected
    ? getBreedingStatus(speciesId, selected.geoid)
    : null;

  return (
    <div className="flex h-screen flex-col bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background px-6 py-3">
        <div className="flex items-baseline justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              NYS Breeding Bird Atlas — Prototype
            </h1>
            <p className="text-xs text-muted-foreground">
              Polymorph-Associates Inc., Albany NY · demo for SUNY ESF / Research Foundation
            </p>
          </div>
          <div className="text-xs text-muted-foreground">v1 · mock data</div>
        </div>
      </header>

      {/* Main 3-column grid */}
      <main className="grid flex-1 gap-4 p-4 overflow-hidden"
            style={{ gridTemplateColumns: "300px 1fr 260px" }}>
        {/* Left column: species picker + info panel */}
        <div className="flex flex-col gap-4 overflow-hidden">
          <div className="rounded-lg border bg-background p-3 shadow-sm space-y-2">
            <label className="text-xs uppercase tracking-wide text-muted-foreground block">
              Species
            </label>
            <input
              type="text"
              value={speciesSearch}
              onChange={(e) => setSpeciesSearch(e.target.value)}
              placeholder="Search species…"
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <SpeciesDropdown
              value={speciesId}
              onChange={setSpeciesId}
              searchQuery={speciesSearch}
            />
          </div>
          <div className="flex-1 overflow-auto">
            <CountyInfoPanel county={selected} species={species} status={status} />
          </div>
        </div>

        {/* Center: base map toggle + map canvas */}
        <div className="flex flex-col gap-3 overflow-hidden">
          <div className="flex items-center justify-between">
            <BaseMapToggle value={baseMap} onChange={setBaseMap} />
          </div>
          <div className="flex-1 overflow-hidden rounded-lg border bg-background shadow-sm">
            <Map
              selectedSpeciesId={speciesId}
              selectedCountyGeoid={selected?.geoid ?? null}
              baseMap={baseMap}
              layerVisibility={layerVisibility}
              onCountyClick={(geoid, name) => setSelected({ geoid, name })}
            />
          </div>
        </div>

        {/* Right: layer panel */}
        <div className="overflow-auto">
          <LayerPanel value={layerVisibility} onChange={setLayerVisibility} />
        </div>
      </main>
    </div>
  );
}
