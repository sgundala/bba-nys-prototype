"use client";

import * as React from "react";
import maplibregl, { type Map as MLMap } from "maplibre-gl";
import { stylesByKey, type BaseMapKey } from "@/lib/map-styles";
import { STATUS_COLORS } from "@/lib/colors";
import { getBreedingStatus, type BreedingStatus } from "@/data/breeding";
import { buildAtlasGrid } from "@/lib/atlas-grid";

const NY_BOUNDS: [[number, number], [number, number]] = [
  [-79.76, 40.49],
  [-71.86, 45.01],
];

const FILL_LAYER = "counties-fill";
const OUTLINE_LAYER = "counties-outline";
const SOURCE_ID = "counties";

const ATLAS_SOURCE = "atlas-blocks";
const ATLAS_LAYER = "atlas-blocks-outline";
// Drop a real atlas-blocks GeoJSON URL here when available; until then we
// fall back to the generated 0.5° grid.
const ATLAS_URL: string | null = null;

export type LayerVisibility = {
  fill: boolean;
  outline: boolean;
  atlasBlocks: boolean;
};

type Props = {
  selectedSpeciesId: string;
  selectedCountyGeoid: string | null;
  baseMap: BaseMapKey;
  layerVisibility: LayerVisibility;
  onCountyClick: (geoid: string, name: string) => void;
  // Bump this number from the parent to animate the map back to NYS bounds.
  // Used by the search bar; dropdown selection does NOT bump it.
  resetSignal?: number;
};

// Custom MapLibre control that fits the view back to the NYS bbox.
class HomeControl implements maplibregl.IControl {
  private _map: MLMap | undefined;
  private _container: HTMLElement | undefined;

  onAdd(map: MLMap): HTMLElement {
    this._map = map;
    this._container = document.createElement("div");
    this._container.className = "maplibregl-ctrl maplibregl-ctrl-group";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.title = "Reset to New York State";
    btn.setAttribute("aria-label", "Reset to New York State");
    btn.innerHTML = "⌂";
    btn.style.fontSize = "16px";
    btn.style.cursor = "pointer";
    btn.style.lineHeight = "1";
    btn.addEventListener("click", () => {
      this._map?.fitBounds(NY_BOUNDS, { padding: 20, duration: 800 });
    });
    this._container.appendChild(btn);
    return this._container;
  }

  onRemove(): void {
    this._container?.parentNode?.removeChild(this._container);
    this._map = undefined;
  }
}

export function Map({
  selectedSpeciesId,
  baseMap,
  layerVisibility,
  onCountyClick,
  resetSignal,
}: Props) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<MLMap | null>(null);
  const countiesRef = React.useRef<GeoJSON.FeatureCollection | null>(null);
  const atlasRef = React.useRef<GeoJSON.FeatureCollection | null>(null);
  const hoveredRef = React.useRef<string | null>(null);

  // Refs so our style.load handler can read current props without re-binding.
  const speciesRef = React.useRef(selectedSpeciesId);
  const visRef = React.useRef(layerVisibility);
  const clickRef = React.useRef(onCountyClick);
  speciesRef.current = selectedSpeciesId;
  visRef.current = layerVisibility;
  clickRef.current = onCountyClick;

  // Adds the counties source + fill + outline layers and all handlers.
  // Must be called every time the style (re)loads, because setStyle wipes
  // custom sources and layers.
  const installCountyLayers = React.useCallback((map: MLMap) => {
    const data = countiesRef.current;
    if (!data) return;

    if (!map.getSource(SOURCE_ID)) {
      map.addSource(SOURCE_ID, {
        type: "geojson",
        data,
        promoteId: "geoid",
      });
    }

    if (!map.getLayer(FILL_LAYER)) {
      map.addLayer({
        id: FILL_LAYER,
        type: "fill",
        source: SOURCE_ID,
        paint: {
          "fill-color": "#e0e0e0",
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.85,
            0.6,
          ],
        },
        layout: {
          visibility: visRef.current.fill ? "visible" : "none",
        },
      });
    }

    if (!map.getLayer(OUTLINE_LAYER)) {
      map.addLayer({
        id: OUTLINE_LAYER,
        type: "line",
        source: SOURCE_ID,
        paint: {
          "line-color": "#374151",
          "line-width": 1,
        },
        layout: {
          visibility: visRef.current.outline ? "visible" : "none",
        },
      });
    }

    // Apply current species coloring via feature-state.
    for (const f of data.features) {
      const geoid = f.properties?.geoid as string | undefined;
      if (!geoid) continue;
      const status = getBreedingStatus(speciesRef.current, geoid);
      map.setFeatureState({ source: SOURCE_ID, id: geoid }, { status });
    }
    map.setPaintProperty(FILL_LAYER, "fill-color", buildColorExpression());

    // Hover
    map.on("mousemove", FILL_LAYER, (e) => {
      if (!e.features?.length) return;
      const id = e.features[0].id as string | undefined;
      if (!id) return;
      if (hoveredRef.current && hoveredRef.current !== id) {
        map.setFeatureState(
          { source: SOURCE_ID, id: hoveredRef.current },
          { hover: false }
        );
      }
      hoveredRef.current = id;
      map.setFeatureState({ source: SOURCE_ID, id }, { hover: true });
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", FILL_LAYER, () => {
      if (hoveredRef.current) {
        map.setFeatureState(
          { source: SOURCE_ID, id: hoveredRef.current },
          { hover: false }
        );
        hoveredRef.current = null;
      }
      map.getCanvas().style.cursor = "";
    });

    // Click
    map.on("click", FILL_LAYER, (e) => {
      const f = e.features?.[0];
      if (!f) return;
      const geoid = (f.properties?.geoid ?? f.id) as string;
      const name = (f.properties?.name as string) ?? "Unknown";
      clickRef.current(geoid, name);
    });
  }, []);

  // Atlas-blocks layer install. Called after each style.load once the atlas
  // GeoJSON is available. Default visibility is off.
  const installAtlasLayers = React.useCallback((map: MLMap) => {
    const data = atlasRef.current;
    if (!data) return;

    if (!map.getSource(ATLAS_SOURCE)) {
      map.addSource(ATLAS_SOURCE, { type: "geojson", data });
    }
    if (!map.getLayer(ATLAS_LAYER)) {
      map.addLayer({
        id: ATLAS_LAYER,
        type: "line",
        source: ATLAS_SOURCE,
        paint: {
          "line-color": "#6b7280",
          "line-width": 0.5,
          "line-opacity": 0.6,
        },
        layout: {
          visibility: visRef.current.atlasBlocks ? "visible" : "none",
        },
      });
    }
  }, []);

  // One-time init.
  React.useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: stylesByKey[baseMap],
      bounds: NY_BOUNDS,
      fitBoundsOptions: { padding: 20 },
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new HomeControl(), "top-right");

    // Load the counties GeoJSON once; reuse across style swaps.
    fetch("/ny-counties.geojson")
      .then((r) => r.json())
      .then((data: GeoJSON.FeatureCollection) => {
        countiesRef.current = data;
        if (map.isStyleLoaded()) {
          installCountyLayers(map);
        } else {
          map.once("style.load", () => installCountyLayers(map));
        }
      });

    // Atlas blocks: try the configured URL, fall back to a 0.5° grid.
    const loadAtlas = (async () => {
      if (ATLAS_URL) {
        try {
          const res = await fetch(ATLAS_URL);
          if (res.ok) {
            return (await res.json()) as GeoJSON.FeatureCollection;
          }
        } catch {
          // swallow and fall back
        }
      }
      return buildAtlasGrid();
    })();

    loadAtlas.then((data) => {
      atlasRef.current = data;
      if (map.isStyleLoaded()) {
        installAtlasLayers(map);
      } else {
        map.once("style.load", () => installAtlasLayers(map));
      }
    });

    map.on("style.load", () => {
      // Fires on every setStyle; re-install custom sources and layers.
      if (countiesRef.current) installCountyLayers(map);
      if (atlasRef.current) installAtlasLayers(map);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Base-map switch.
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(stylesByKey[baseMap]);
  }, [baseMap]);

  // Species change → update feature-state + the color expression.
  React.useEffect(() => {
    const map = mapRef.current;
    const data = countiesRef.current;
    if (!map || !data) return;
    if (!map.getSource(SOURCE_ID)) return;
    for (const f of data.features) {
      const geoid = f.properties?.geoid as string | undefined;
      if (!geoid) continue;
      const status = getBreedingStatus(selectedSpeciesId, geoid);
      map.setFeatureState({ source: SOURCE_ID, id: geoid }, { status });
    }
  }, [selectedSpeciesId]);

  // Layer visibility toggles.
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (map.getLayer(FILL_LAYER)) {
      map.setLayoutProperty(
        FILL_LAYER,
        "visibility",
        layerVisibility.fill ? "visible" : "none"
      );
    }
    if (map.getLayer(OUTLINE_LAYER)) {
      map.setLayoutProperty(
        OUTLINE_LAYER,
        "visibility",
        layerVisibility.outline ? "visible" : "none"
      );
    }
    if (map.getLayer(ATLAS_LAYER)) {
      map.setLayoutProperty(
        ATLAS_LAYER,
        "visibility",
        layerVisibility.atlasBlocks ? "visible" : "none"
      );
    }
  }, [layerVisibility]);

  // Reset-view signal: animate back to NYS bounds whenever the parent bumps
  // the counter. Skip the initial mount (undefined/0 on first render).
  const lastResetRef = React.useRef<number | undefined>(resetSignal);
  React.useEffect(() => {
    if (resetSignal === undefined) return;
    if (lastResetRef.current === resetSignal) return;
    lastResetRef.current = resetSignal;
    const map = mapRef.current;
    if (!map) return;
    map.fitBounds(NY_BOUNDS, { padding: 20, duration: 800 });
  }, [resetSignal]);

  return <div ref={containerRef} className="h-full w-full" />;
}

function buildColorExpression(): maplibregl.ExpressionSpecification {
  // match on the feature-state 'status' value
  return [
    "match",
    ["coalesce", ["feature-state", "status"], "none"],
    "confirmed", STATUS_COLORS.confirmed,
    "probable", STATUS_COLORS.probable,
    "possible", STATUS_COLORS.possible,
    STATUS_COLORS.none,
  ] as unknown as maplibregl.ExpressionSpecification;
}

// Silence unused import warning — re-export for consumers that want the type.
export type { BreedingStatus };
