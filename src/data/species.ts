export type Species = {
  id: string;
  commonName: string;
  scientificName: string;
};

export const SPECIES: Species[] = [
  { id: "amro", commonName: "American Robin", scientificName: "Turdus migratorius" },
  { id: "blja", commonName: "Blue Jay", scientificName: "Cyanocitta cristata" },
  { id: "rtha", commonName: "Red-tailed Hawk", scientificName: "Buteo jamaicensis" },
  { id: "bcch", commonName: "Black-capped Chickadee", scientificName: "Poecile atricapillus" },
  { id: "coye", commonName: "Common Yellowthroat", scientificName: "Geothlypis trichas" },
  { id: "ospr", commonName: "Osprey", scientificName: "Pandion haliaetus" },
];

export function speciesById(id: string): Species | undefined {
  return SPECIES.find((s) => s.id === id);
}
