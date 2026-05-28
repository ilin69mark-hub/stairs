"use client";

import { ToggleGroup } from "@base-ui/react/toggle-group";
import { Toggle } from "@base-ui/react/toggle";
import type { Projection } from "@/types/blueprint";

interface Props {
  value: Projection;
  onChange: (projection: Projection) => void;
}

const labels: Record<Projection, string> = {
  top: "Вид сверху",
  front: "Вид спереди",
  side: "Вид сбоку",
};

const projections: Projection[] = ["top", "front", "side"];

export function ProjectionToggle({ value, onChange }: Props) {
  return (
    <ToggleGroup
      value={[value]}
      onValueChange={(v) => {
        if (v.length > 0) onChange(v[0] as Projection);
      }}
      className="inline-flex rounded-lg border border-border bg-background p-0.5"
    >
      {projections.map((p) => (
        <Toggle
          key={p}
          value={p}
          className="group/toggle rounded-md px-3 py-1.5 text-sm font-medium transition-all select-none aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:shadow-sm not-aria-pressed:text-muted-foreground not-aria-pressed:hover:bg-muted not-aria-pressed:hover:text-foreground"
        >
          {labels[p]}
        </Toggle>
      ))}
    </ToggleGroup>
  );
}
