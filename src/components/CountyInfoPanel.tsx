"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/colors";
import type { Species } from "@/data/species";
import type { BreedingStatus } from "@/data/breeding";

type Props = {
  county: { geoid: string; name: string } | null;
  species: Species;
  status: BreedingStatus | null;
};

const ATLAS_PERIOD = "2020–2024";

export function CountyInfoPanel({ county, species, status }: Props) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>County details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {!county ? (
          <p className="text-muted-foreground">
            Click a county on the map to see its breeding-status details for the selected species.
          </p>
        ) : (
          <>
            <div>
              <div className="text-muted-foreground text-xs uppercase tracking-wide">County</div>
              <div className="font-medium text-base">{county.name}</div>
            </div>

            <div>
              <div className="text-muted-foreground text-xs uppercase tracking-wide">Species</div>
              <div className="font-medium">{species.commonName}</div>
              <div className="text-muted-foreground italic">{species.scientificName}</div>
            </div>

            <div>
              <div className="text-muted-foreground text-xs uppercase tracking-wide mb-1">
                Breeding status
              </div>
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  backgroundColor: status ? STATUS_COLORS[status] : STATUS_COLORS.none,
                  color: status === "confirmed" || status === "probable" ? "white" : "#1f2937",
                }}
              >
                {status ? STATUS_LABELS[status] : STATUS_LABELS.none}
              </span>
            </div>

            <div>
              <div className="text-muted-foreground text-xs uppercase tracking-wide">
                Atlas period
              </div>
              <div className="font-medium">{ATLAS_PERIOD}</div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
