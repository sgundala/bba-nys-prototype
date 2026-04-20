"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/colors";
import type { LayerVisibility } from "@/components/Map";
import type { BreedingStatus } from "@/data/breeding";

type Props = {
  value: LayerVisibility;
  onChange: (v: LayerVisibility) => void;
};

const LEGEND_ORDER: BreedingStatus[] = ["confirmed", "probable", "possible", "none"];

export function LayerPanel({ value, onChange }: Props) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Layers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 text-sm">
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value.fill}
              onChange={(e) => onChange({ ...value, fill: e.target.checked })}
              className="h-4 w-4 accent-primary"
            />
            <span>County fill</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value.outline}
              onChange={(e) => onChange({ ...value, outline: e.target.checked })}
              className="h-4 w-4 accent-primary"
            />
            <span>County outline</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value.atlasBlocks}
              onChange={(e) =>
                onChange({ ...value, atlasBlocks: e.target.checked })
              }
              className="h-4 w-4 accent-primary"
            />
            <span>Atlas blocks</span>
          </label>
        </div>

        <div className="border-t pt-4">
          <div className="text-muted-foreground text-xs uppercase tracking-wide mb-2">
            Legend
          </div>
          <ul className="space-y-1.5">
            {LEGEND_ORDER.map((s) => (
              <li key={s} className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-sm border border-gray-300"
                  style={{ backgroundColor: STATUS_COLORS[s] }}
                />
                <span>{STATUS_LABELS[s]}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
