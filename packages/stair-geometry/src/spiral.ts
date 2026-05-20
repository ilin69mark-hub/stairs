import { StairInput, StairGeometry, Step } from './types';
import { calculateTreadDepth } from './utils';

const IDEAL_SPIRAL_RISE = 190;
const MIN_STEPS = 5;
const MIN_RADIUS = 200;
const RADIUS_OFFSET = 100;

export function calculateSpiral(input: StairInput): StairGeometry {
  const totalSteps = Math.max(MIN_STEPS, Math.round(input.floorHeight / IDEAL_SPIRAL_RISE));
  const rise = input.floorHeight / totalSteps;
  
  const radius = Math.max(MIN_RADIUS, input.openingWidth / 2 - RADIUS_OFFSET);
  
  const totalAngle = 2 * Math.PI + (totalSteps / 10) * Math.PI;
  const anglePerStep = totalAngle / totalSteps;
  
  const tread = radius * anglePerStep * 0.8;

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

  if (radius < MIN_RADIUS + 50) {
    warnings.push(`Spiral radius ${radius.toFixed(0)}mm is relatively small`);
  }

  return {
    steps,
    totalSteps: steps.length,
    totalRise: input.floorHeight,
    inclination: 0,
    isValid: warnings.length === 0,
    warnings,
  };
}