"use client";

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
};

export function SpeciesDropdown({ value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select a species" />
      </SelectTrigger>
      <SelectContent>
        {SPECIES.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            {s.commonName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
