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