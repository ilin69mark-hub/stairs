import { StairInput, StairGeometry, Step } from './types';
import { validateStairWidth } from './utils';
import { SNIP } from './utils';

const IDEAL_SPIRAL_RISE = 190;
const MIN_STEPS = 5;

export function calculateSpiral(input: StairInput): StairGeometry {
  const totalSteps = Math.max(MIN_STEPS, Math.round(input.floorHeight / IDEAL_SPIRAL_RISE));
  const rise = input.floorHeight / totalSteps;
  
  const radiusX = Math.max(SNIP.SPIRAL_MIN_RADIUS, input.openingWidth / 2 - SNIP.SPIRAL_RADIUS_OFFSET);
  const radiusZ = input.openingLength > 0
    ? Math.max(SNIP.SPIRAL_MIN_RADIUS, input.openingLength / 2 - SNIP.SPIRAL_RADIUS_OFFSET)
    : radiusX;
  
  const totalAngle = 2 * Math.PI + (totalSteps / 10) * Math.PI;
  const anglePerStep = totalAngle / totalSteps;
  
  const treadAtLineOfTravel = radiusX * anglePerStep * SNIP.SPIRAL_TREAD_FACTOR;
  const inclination = Math.atan(rise / treadAtLineOfTravel) * (180 / Math.PI);

  const steps: Step[] = [];

  for (let i = 0; i < totalSteps; i++) {
    const angle = i * anglePerStep;
    
    steps.push({
      index: i,
      x: radiusX * Math.cos(angle),
      y: (i + 1) * rise,
      z: radiusZ * Math.sin(angle),
      rotationY: angle + Math.PI / 2,
      isWinder: true,
      treadDepth: treadAtLineOfTravel,
      riseHeight: rise,
      width: input.stepWidth,
    });
  }

  const lastStep = steps[steps.length - 1];
  const warnings: string[] = [];

  for (let i = 1; i < steps.length; i++) {
    if (steps[i].index !== steps[i - 1].index + 1) {
      warnings.push(`Step indices not sequential at position ${i}`);
    }
  }

  if (Math.abs(lastStep.y - input.floorHeight) > 1) {
    warnings.push(`Last step y (${lastStep.y.toFixed(1)}) does not match floor height (${input.floorHeight})`);
  }

  if (radiusX < SNIP.SPIRAL_MIN_RADIUS + 50) {
    warnings.push(`Spiral radius ${radiusX.toFixed(0)}mm is relatively small`);
  }

  const widthWarnings = validateStairWidth(input.stepWidth);
  warnings.push(...widthWarnings);

  return {
    steps,
    totalSteps: steps.length,
    totalRise: input.floorHeight,
    inclination,
    isValid: warnings.length === 0,
    warnings,
  };
}