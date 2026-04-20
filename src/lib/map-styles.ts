import type { StyleSpecification } from "maplibre-gl";

export type BaseMapKey = "streets" | "satellite" | "terrain";

export const streetsStyle: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
      minzoom: 0,
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "osm-layer",
      type: "raster",
      source: "osm",
    },
  ],
};

export const satelliteStyle: StyleSpecification = {
  version: 8,
  sources: {
    esri: {
      type: "raster",
      // Esri tile path is {z}/{y}/{x} — y before x
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "Tiles © Esri — Source: Esri, USGS, NOAA",
      minzoom: 0,
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "esri-layer",
      type: "raster",
      source: "esri",
    },
  ],
};

export const terrainStyle: StyleSpecification = {
  version: 8,
  sources: {
    topo: {
      type: "raster",
      // OpenTopoMap: pass the 3 subdomains explicitly; {a-c} shorthand does not work
      tiles: [
        "https://a.tile.opentopomap.org/{z}/{x}/{y}.png",
        "https://b.tile.opentopomap.org/{z}/{x}/{y}.png",
        "https://c.tile.opentopomap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© OpenTopoMap contributors, CC-BY-SA",
      minzoom: 0,
      maxzoom: 17,
    },
  },
  layers: [
    {
      id: "topo-layer",
      type: "raster",
      source: "topo",
    },
  ],
};

export const stylesByKey: Record<BaseMapKey, StyleSpecification> = {
  streets: streetsStyle,
  satellite: satelliteStyle,
  terrain: terrainStyle,
};
