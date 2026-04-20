import type { BreedingStatus } from "@/data/breeding";

export const STATUS_COLORS: Record<BreedingStatus, string> = {
  confirmed: "#2d6a4f",
  probable: "#74c69d",
  possible: "#d8f3dc",
  none: "#e0e0e0",
};

export const STATUS_LABELS: Record<BreedingStatus, string> = {
  confirmed: "Confirmed",
  probable: "Probable",
  possible: "Possible",
  none: "Not observed",
};
