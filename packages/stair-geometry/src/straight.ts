import { StairInput, StairGeometry, Step } from './types';
import { calculateStepsCount, calculateTreadDepth, calculateInclination, validateSnip, validateStairWidth } from './utils';

export function calculateStraight(input: StairInput): StairGeometry {
  const totalSteps = calculateStepsCount(input.floorHeight);
  const rise = input.floorHeight / totalSteps;
  const tread = calculateTreadDepth(rise);
  const totalRun = tread * (totalSteps - 1);
  const inclination = calculateInclination(input.floorHeight, totalRun);

  const steps: Step[] = [];
  for (let i = 0; i < totalSteps; i++) {
    steps.push({
      index: i,
      x: 0,
      y: (i + 1) * rise,
      z: i * tread,
      rotationY: 0,
      isWinder: false,
      treadDepth: tread,
      riseHeight: rise,
      width: input.stepWidth,
    });
  }

  const validation = validateSnip(rise, tread, inclination, totalSteps);
  const widthWarnings = validateStairWidth(input.stepWidth);

  return {
    steps,
    totalSteps,
    totalRise: input.floorHeight,
    inclination,
    isValid: validation.isValid && widthWarnings.length === 0,
    warnings: [...validation.warnings, ...widthWarnings],
  };
}