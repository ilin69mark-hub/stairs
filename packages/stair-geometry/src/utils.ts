import { StairInput, Step } from './types';

/**
 * SNIP (Строительные Нормы и Правила) constants for stair design.
 * Defines acceptable ranges for rise, tread, inclination, and comfort formula.
 */
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
  WINDER_COUNT_L: 5,
  WINDER_COUNT_U: 3,
  MIN_FLOOR_HEIGHT: 500,
  MAX_FLOOR_HEIGHT: 5000,
  MIN_STEP_WIDTH: 400,
  MAX_STEP_WIDTH: 2000,
  MIN_OPENING: 500,
  MAX_OPENING: 10000,
  SPIRAL_IDEAL_RISE: 190,
  SPIRAL_MIN_STEPS: 5,
  SPIRAL_MIN_RADIUS: 200,
  SPIRAL_RADIUS_OFFSET: 100,
  SPIRAL_TREAD_FACTOR: 0.8,
  SPIRAL_TOTAL_ANGLE_BASE: 2 * Math.PI,
  SPIRAL_TOTAL_ANGLE_EXTRA: Math.PI / 10,
  FLOOR_HEIGHT_TOLERANCE: 1,
} as const;

export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
}

/**
 * Validates stair input parameters. Throws if any value is out of acceptable range.
 */
export function validateInput(input: StairInput): void {
  const errors: string[] = [];

  if (input.floorHeight < SNIP.MIN_FLOOR_HEIGHT || input.floorHeight > SNIP.MAX_FLOOR_HEIGHT) {
    errors.push(
      `floorHeight must be between ${SNIP.MIN_FLOOR_HEIGHT} and ${SNIP.MAX_FLOOR_HEIGHT}mm, got ${input.floorHeight}`
    );
  }
  if (input.stepWidth < SNIP.MIN_STEP_WIDTH || input.stepWidth > SNIP.MAX_STEP_WIDTH) {
    errors.push(
      `stepWidth must be between ${SNIP.MIN_STEP_WIDTH} and ${SNIP.MAX_STEP_WIDTH}mm, got ${input.stepWidth}`
    );
  }
  if (input.openingWidth < SNIP.MIN_OPENING || input.openingWidth > SNIP.MAX_OPENING) {
    errors.push(
      `openingWidth must be between ${SNIP.MIN_OPENING} and ${SNIP.MAX_OPENING}mm, got ${input.openingWidth}`
    );
  }
  if (input.openingLength < SNIP.MIN_OPENING || input.openingLength > SNIP.MAX_OPENING) {
    errors.push(
      `openingLength must be between ${SNIP.MIN_OPENING} and ${SNIP.MAX_OPENING}mm, got ${input.openingLength}`
    );
  }

  if (errors.length > 0) {
    throw new Error(`Invalid stair input: ${errors.join('; ')}`);
  }
}

/**
 * Validates step array consistency: sequential indices and final y matches floor height.
 */
export function validateStepsConsistency(steps: Step[], floorHeight: number): ValidationResult {
  const warnings: string[] = [];

  for (let i = 1; i < steps.length; i++) {
    if (steps[i].index !== steps[i - 1].index + 1) {
      warnings.push(`Step indices not sequential at position ${i}`);
    }
  }

  const lastStep = steps[steps.length - 1];
  if (Math.abs(lastStep.y - floorHeight) > SNIP.FLOOR_HEIGHT_TOLERANCE) {
    warnings.push(`Last step y (${lastStep.y.toFixed(1)}) does not match floor height (${floorHeight})`);
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  };
}

/**
 * Clamps a value between min and max (inclusive).
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculates the optimal number of steps for a given floor height.
 * Uses SNIP ideal rise as starting point, then adjusts to stay within min/max bounds.
 */
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

/**
 * Calculates tread depth using the comfort formula: 2*rise + tread = 620mm.
 * Result is clamped to SNIP min/max tread range.
 */
export function calculateTreadDepth(rise: number): number {
  const calculated = SNIP.COMFORT_FORMULA - 2 * rise;
  return clamp(calculated, SNIP.MIN_TREAD, SNIP.MAX_TREAD);
}

/**
 * Calculates stair inclination angle in degrees from floor height and total run.
 */
export function calculateInclination(floorHeight: number, totalRun: number): number {
  if (totalRun === 0) return 0;
  return Math.atan2(floorHeight, totalRun) * (180 / Math.PI);
}

/**
 * Validates stair parameters against SNIP standards.
 * Checks rise, tread, inclination, step count, and comfort formula.
 */
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
    warnings.push(
      `Inclination ${inclination.toFixed(1)}° is outside SNIP range (${SNIP.MIN_INCLINATION}-${SNIP.MAX_INCLINATION}°)`
    );
  }

  if (stepsCount < SNIP.MIN_STEPS_PER_MARCH) {
    warnings.push(`Step count ${stepsCount} is below minimum ${SNIP.MIN_STEPS_PER_MARCH}`);
  }

  const comfortValue = 2 * rise + tread;
  if (Math.abs(comfortValue - SNIP.COMFORT_FORMULA) > SNIP.COMFORT_TOLERANCE) {
    warnings.push(
      `Comfort formula deviation: ${comfortValue} differs from ideal ${SNIP.COMFORT_FORMULA} by more than ${SNIP.COMFORT_TOLERANCE}`
    );
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  };
}
