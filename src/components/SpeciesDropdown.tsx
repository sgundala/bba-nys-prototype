"use client";

import * as React from "react";
import { SPECIES } from "@/data/species";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  value: string;
  onChange: (id: string) => void;
  searchQuery?: string;
  // Fires only when a species is selected via search-narrow auto-select,
  // not when the user picks from the dropdown. Parent uses this to reset
  // the map view back to NYS bounds.
  onSearchSelect?: (id: string) => void;
};

export function SpeciesDropdown({
  value,
  onChange,
  searchQuery = "",
  onSearchSelect,
}: Props) {
  const filtered = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return SPECIES;
    return SPECIES.filter(
      (s) =>
        s.commonName.toLowerCase().includes(q) ||
        s.scientificName.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Auto-select when the filter narrows to exactly one match. This path is
  // the "search-driven" selection — notify onSearchSelect as well as onChange.
  React.useEffect(() => {
    if (filtered.length === 1 && filtered[0].id !== value) {
      onChange(filtered[0].id);
      onSearchSelect?.(filtered[0].id);
    }
  }, [filtered, value, onChange, onSearchSelect]);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select a species" />
      </SelectTrigger>
      <SelectContent>
        {filtered.length === 0 ? (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            No species found
          </div>
        ) : (
          filtered.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.commonName}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
