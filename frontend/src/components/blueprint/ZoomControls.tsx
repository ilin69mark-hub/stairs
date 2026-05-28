"use client";

import { Button } from "@/components/ui/button";

interface Props {
  scale: number;
  onChange: (scale: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function ZoomControls({
  scale,
  onChange,
  min = 0.1,
  max = 5.0,
  step = 0.1,
}: Props) {
  const pct = Math.round(scale * 100);

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-background p-0.5">
      <Button
        variant="ghost"
        size="xs"
        disabled={scale <= min}
        onClick={() => onChange(Math.max(min, +(scale - step).toFixed(2)))}
      >
        −
      </Button>
      <span className="w-12 text-center text-xs font-medium tabular-nums select-none">
        {pct}%
      </span>
      <Button
        variant="ghost"
        size="xs"
        disabled={scale >= max}
        onClick={() => onChange(Math.min(max, +(scale + step).toFixed(2)))}
      >
        +
      </Button>
    </div>
  );
}
