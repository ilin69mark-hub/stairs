import type { StairGeometry } from "@stairs/geometry";

export type Projection = "top" | "front" | "side";

import type Konva from "konva";
import type { RefObject } from "react";

export interface BlueprintProps {
  geometry: StairGeometry;
  scale: number;
  projection: Projection;
  showDimensions: boolean;
  showLabels: boolean;
  stageRef?: RefObject<Konva.Stage | null>;
  hoveredStepIndex?: number | null;
  onStepHover?: (stepIndex: number | null) => void;
  openingWidth?: number;
  openingLength?: number;
  material?: string;
  stringerMaterial?: string;
  stringerThickness?: number;
  stepThickness?: number;
  overhang?: number;
}

export interface DimensionLine {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  label: string;
  offset: number;
  extX1: number;
  extY1: number;
  extX2: number;
  extY2: number;
}
