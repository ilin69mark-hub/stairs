import { StairInput, StairGeometry, Step } from './types';
import {
  calculateStepsCount,
  calculateInclination,
  validateSnip,
  validateInput,
  validateStepsConsistency,
  SNIP,
} from './utils';

/**
 * Calculates geometry for a spiral (helical) staircase.
 */
export function calculateSpiral(input: StairInput): StairGeometry {
  validateInput(input);

  const totalSteps = input.totalSteps ?? Math.max(SNIP.SPIRAL_MIN_STEPS, calculateStepsCount(input.floorHeight));
  const rise = input.floorHeight / totalSteps;

  const radius = Math.max(SNIP.SPIRAL_MIN_RADIUS, input.openingWidth / 2 - SNIP.SPIRAL_RADIUS_OFFSET);

  const totalAngle = SNIP.SPIRAL_TOTAL_ANGLE_BASE + totalSteps * SNIP.SPIRAL_TOTAL_ANGLE_EXTRA;
  const anglePerStep = totalAngle / totalSteps;

  const tread = radius * anglePerStep;

  const steps: Step[] = [];

  for (let i = 0; i < totalSteps; i++) {
    const angle = i * anglePerStep;

    steps.push({
      index: i,
      x: radius * Math.cos(angle),
      y: (i + 1) * rise,
      z: radius * Math.sin(angle),
      rotationY: angle + Math.PI / 2,
      isWinder: true,
      treadDepth: tread,
      riseHeight: rise,
      width: input.stepWidth,
      winderCount: totalSteps,
      winderTotalAngle: totalAngle,
    });
  }

  const run = radius * totalAngle;
  const inclination = calculateInclination(input.floorHeight, run);

  const validation = validateSnip(rise, tread, inclination, steps.length);
  const stepsValidation = validateStepsConsistency(steps, input.floorHeight);

  if (radius < SNIP.SPIRAL_MIN_RADIUS + 50) {
    stepsValidation.warnings.push(`Spiral radius ${radius.toFixed(0)}mm is relatively small`);
  }

  return {
    steps,
    totalSteps: steps.length,
    totalRise: input.floorHeight,
    inclination,
    isValid: validation.isValid && stepsValidation.isValid,
    warnings: [...validation.warnings, ...stepsValidation.warnings],
  };
}
