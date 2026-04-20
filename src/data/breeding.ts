export type BreedingStatus = "confirmed" | "probable" | "possible" | "none";

const STATUSES: BreedingStatus[] = ["confirmed", "probable", "possible", "none"];

// Deterministic hash → status. Same (speciesId, geoid) always returns the same
// status across reloads without storing a 310-entry lookup table.
function hash(a: string, b: string): number {
  let h = 2166136261;
  const s = a + "|" + b;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Osprey: hardcoded coastal distribution — Nassau + Suffolk confirmed,
// NYC boroughs + Westchester probable/possible, everything else "none".
// This creates the dramatic coastal-vs-inland contrast used for the demo.
const OSPREY_BY_GEOID: Record<string, BreedingStatus> = {
  "05000US36059": "confirmed", // Nassau
  "05000US36103": "confirmed", // Suffolk
  "05000US36081": "probable",  // Queens
  "05000US36085": "probable",  // Richmond (Staten Island)
  "05000US36047": "possible",  // Kings (Brooklyn)
  "05000US36061": "possible",  // New York (Manhattan)
  "05000US36005": "possible",  // Bronx
  "05000US36119": "possible",  // Westchester
};

export function getBreedingStatus(speciesId: string, geoid: string): BreedingStatus {
  if (speciesId === "ospr") {
    return OSPREY_BY_GEOID[geoid] ?? "none";
  }
  // Bias toward the "none" tail a little so maps aren't uniformly green-ish
  const buckets: BreedingStatus[] = [
    "confirmed", "confirmed",
    "probable", "probable",
    "possible", "possible", "possible",
    "none", "none",
  ];
  return buckets[hash(speciesId, geoid) % buckets.length];
}
