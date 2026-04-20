"use client";

import * as React from "react";
import maplibregl, { type Map as MLMap } from "maplibre-gl";
import { stylesByKey, type BaseMapKey } from "@/lib/map-styles";
import { STATUS_COLORS } from "@/lib/colors";
import { getBreedingStatus, type BreedingStatus } from "@/data/breeding";

const NY_BOUNDS: [[number, number], [number, number]] = [
  [-79.76, 40.49],
  [-71.86, 45.01],
];

const FILL_LAYER = "counties-fill";
const OUTLINE_LAYER = "counties-outline";
const SOURCE_ID = "counties";

export type LayerVisibility = { fill: boolean; outline: boolean };

type Props = {
  selectedSpeciesId: string;
  selectedCountyGeoid: string | null;
  baseMap: BaseMapKey;
  layerVisibility: LayerVisibility;
  onCountyClick: (geoid: string, name: string) => void;
};

export function Map({
  selectedSpeciesId,
  baseMap,
  layerVisibility,
  onCountyClick,
}: Props) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<MLMap | null>(null);
  const countiesRef = React.useRef<GeoJSON.FeatureCollection | null>(null);
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

    map.on("style.load", () => {
      // Fires on every setStyle; re-install county layers.
      if (countiesRef.current) installCountyLayers(map);
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
  }, [layerVisibility]);

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
