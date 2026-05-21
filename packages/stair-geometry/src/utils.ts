import { StairInput } from './types';

export const SNIP = {
  MIN_RISE: 150,
  MAX_RISE: 200,
  IDEAL_RISE: 175,
  MIN_TREAD: 250,
  MAX_TREAD: 350,
  MIN_INCLINATION: 30,
  MAX_INCLINATION: 45,
  COMFORT_FORMULA: 620,
  COMFORT_TOLERANCE: 20,
  MIN_STEPS_PER_MARCH: 3,
  WINDER_COUNT_L: 3,
  WINDER_COUNT_U: 3,
  MIN_WINDER_WIDTH_NARROW: 100,
  MIN_WINDER_WIDTH_CENTER: 200,
  MIN_STAIR_WIDTH: 900,
  MIN_CLEARANCE_HEIGHT: 2000,
  WINDER_RADIUS_FACTOR: 0.8,
  WINDER_RADIUS_MIN_FACTOR: 0.6,
  WINDER_RADIUS_MAX_FACTOR: 1.4,
  SPIRAL_RADIUS_OFFSET: 100,
  SPIRAL_MIN_RADIUS: 200,
  SPIRAL_TREAD_FACTOR: 0.8,
  U_SHAPED_TURN_OFFSET_FACTOR: 1.0,
} as const;

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function calculateStepsCount(floorHeight: number): number {
  let steps = Math.round(floorHeight / SNIP.IDEAL_RISE);
  if (steps < SNIP.MIN_STEPS_PER_MARCH) {
    steps = SNIP.MIN_STEPS_PER_MARCH;
  }
  const rise = floorHeight / steps;
  if (rise < SNIP.MIN_RISE) {
    steps = Math.ceil(floorHeight / SNIP.MIN_RISE);
  } else if (rise > SNIP.MAX_RISE) {
    steps = Math.ceil(floorHeight / SNIP.MAX_RISE);
  }
  return Math.max(steps, SNIP.MIN_STEPS_PER_MARCH);
}

export function calculateTreadDepth(rise: number): number {
  const calculated = SNIP.COMFORT_FORMULA - 2 * rise;
  return clamp(calculated, SNIP.MIN_TREAD, SNIP.MAX_TREAD);
}

export function calculateInclination(floorHeight: number, totalRun: number): number {
  if (totalRun === 0) return 0;
  return Math.atan2(floorHeight, totalRun) * (180 / Math.PI);
}

export function validateSnip(
  rise: number,
  tread: number,
  inclination: number,
  stepsCount: number
): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  if (rise < SNIP.MIN_RISE || rise > SNIP.MAX_RISE) {
    warnings.push(`Rise ${rise}mm is outside SNIP range (${SNIP.MIN_RISE}-${SNIP.MAX_RISE}mm)`);
  }
  
  if (tread < SNIP.MIN_TREAD || tread > SNIP.MAX_TREAD) {
    warnings.push(`Tread ${tread}mm is outside SNIP range (${SNIP.MIN_TREAD}-${SNIP.MAX_TREAD}mm)`);
  }
  
  if (inclination < SNIP.MIN_INCLINATION || inclination > SNIP.MAX_INCLINATION) {
    warnings.push(`Inclination ${inclination.toFixed(1)}° is outside SNIP range (${SNIP.MIN_INCLINATION}-${SNIP.MAX_INCLINATION}°)`);
  }
  
  if (stepsCount < SNIP.MIN_STEPS_PER_MARCH) {
    warnings.push(`Step count ${stepsCount} is below minimum ${SNIP.MIN_STEPS_PER_MARCH}`);
  }
  
  const comfortValue = rise + 2 * tread;
  if (Math.abs(comfortValue - SNIP.COMFORT_FORMULA) > SNIP.COMFORT_TOLERANCE) {
    warnings.push(`Comfort formula deviation: ${comfortValue} differs from ideal ${SNIP.COMFORT_FORMULA} by more than ${SNIP.COMFORT_TOLERANCE}`);
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
  };
}

export function validateWinderSteps(
  steps: { index: number; isWinder: boolean; width: number; treadDepth: number }[]
): string[] {
  const warnings: string[] = [];
  const winderSteps = steps.filter(s => s.isWinder);
  
  if (winderSteps.length === 0) return warnings;
  
  for (const step of winderSteps) {
    const narrowWidth = step.width * 0.3;
    const centerWidth = step.width * 0.5;
    
    if (narrowWidth < SNIP.MIN_WINDER_WIDTH_NARROW) {
      warnings.push(`Winder step ${step.index}: narrow width ${narrowWidth.toFixed(0)}mm is below minimum ${SNIP.MIN_WINDER_WIDTH_NARROW}mm`);
    }
    
    if (centerWidth < SNIP.MIN_WINDER_WIDTH_CENTER) {
      warnings.push(`Winder step ${step.index}: center width ${centerWidth.toFixed(0)}mm is below minimum ${SNIP.MIN_WINDER_WIDTH_CENTER}mm`);
    }
  }
  
  return warnings;
}

export function validateStairInput(input: StairInput): string[] {
  const warnings: string[] = [];
  
  if (input.floorHeight <= 0) {
    warnings.push('Floor height must be positive');
  }
  
  if (input.floorHeight < 1000) {
    warnings.push(`Floor height ${input.floorHeight}mm is unusually small`);
  }
  
  if (input.floorHeight > 5000) {
    warnings.push(`Floor height ${input.floorHeight}mm is unusually large`);
  }
  
  if (input.openingWidth <= 0) {
    warnings.push('Opening width must be positive');
  }
  
  if (input.openingWidth < 800) {
    warnings.push(`Opening width ${input.openingWidth}mm is below minimum passage width`);
  }
  
  if (input.openingLength <= 0) {
    warnings.push('Opening length must be positive');
  }
  
  if (input.stepWidth <= 0) {
    warnings.push('Step width must be positive');
  }
  
  return warnings;
}

export function validateStairWidth(stepWidth: number): string[] {
  const warnings: string[] = [];
  if (stepWidth < SNIP.MIN_STAIR_WIDTH) {
    warnings.push(`Stair width ${stepWidth}mm is below minimum ${SNIP.MIN_STAIR_WIDTH}mm`);
  }
  return warnings;
}