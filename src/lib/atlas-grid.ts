// Fallback atlas-block grid — a simple 0.5° lat/lon grid over the NYS bbox.
// Used when the real atlas-blocks GeoJSON URL is unavailable.

const BBOX = {
  west: -79.76,
  south: 40.49,
  east: -71.86,
  north: 45.01,
};

const STEP = 0.5;

export function buildAtlasGrid(): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];

  // Vertical lines (constant lon)
  for (let lon = Math.ceil(BBOX.west / STEP) * STEP; lon <= BBOX.east; lon += STEP) {
    features.push({
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [lon, BBOX.south],
          [lon, BBOX.north],
        ],
      },
    });
  }

  // Horizontal lines (constant lat)
  for (let lat = Math.ceil(BBOX.south / STEP) * STEP; lat <= BBOX.north; lat += STEP) {
    features.push({
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [BBOX.west, lat],
          [BBOX.east, lat],
        ],
      },
    });
  }

  return { type: "FeatureCollection", features };
}
