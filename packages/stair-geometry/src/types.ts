export type StairType = 'straight' | 'l-shaped' | 'u-shaped' | 'spiral';

export interface StairInput {
  type: StairType;
  floorHeight: number;
  openingWidth: number;
  openingLength: number;
  stepWidth: number;
}

export interface Step {
  index: number;
  x: number;
  y: number;
  z: number;
  rotationY: number;
  isWinder: boolean;
  treadDepth: number;
  riseHeight: number;
  width: number;
}

export interface StairGeometry {
  steps: Step[];
  totalSteps: number;
  totalRise: number;
  inclination: number;
  isValid: boolean;
  warnings: string[];
}