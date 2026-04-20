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

export function getBreedingStatus(speciesId: string, geoid: string): BreedingStatus {
  // Bias toward the "none" tail a little so maps aren't uniformly green-ish
  const buckets: BreedingStatus[] = [
    "confirmed", "confirmed",
    "probable", "probable",
    "possible", "possible", "possible",
    "none", "none",
  ];
  return buckets[hash(speciesId, geoid) % buckets.length];
}
