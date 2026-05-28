"use client";

import { Button } from "@/components/ui/button";

interface Props {
  value: "3d" | "2d";
  onChange: (mode: "3d" | "2d") => void;
}

export function ViewModeToggle({ value, onChange }: Props) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-background p-0.5">
      <Button
        variant={value === "3d" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("3d")}
      >
        <svg
          className="size-4 mr-1.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
        3D
      </Button>
      <Button
        variant={value === "2d" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("2d")}
      >
        <svg
          className="size-4 mr-1.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
        2D
      </Button>
    </div>
  );
}
