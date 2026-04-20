"use client";

import { Button } from "@/components/ui/button";
import type { BaseMapKey } from "@/lib/map-styles";

const OPTIONS: { key: BaseMapKey; label: string }[] = [
  { key: "streets", label: "Streets" },
  { key: "satellite", label: "Satellite" },
  { key: "terrain", label: "Terrain" },
];

type Props = {
  value: BaseMapKey;
  onChange: (key: BaseMapKey) => void;
};

export function BaseMapToggle({ value, onChange }: Props) {
  return (
    <div className="inline-flex rounded-md border bg-background p-1 shadow-sm">
      {OPTIONS.map((o) => (
        <Button
          key={o.key}
          size="sm"
          variant={value === o.key ? "default" : "ghost"}
          onClick={() => onChange(o.key)}
          className="px-3"
        >
          {o.label}
        </Button>
      ))}
    </div>
  );
}
