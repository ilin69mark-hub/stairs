import { StairInput, StairGeometry, Step } from './types';
import { calculateStepsCount, calculateTreadDepth } from './utils';
import { SNIP } from './utils';

export function calculateLShaped(input: StairInput): StairGeometry {
  const totalSteps = calculateStepsCount(input.floorHeight);
  const rise = input.floorHeight / totalSteps;
  const tread = calculateTreadDepth(rise);

  const winderCount = SNIP.WINDER_COUNT_L;
  const straightTotal = totalSteps - winderCount;
  const lowerSteps = Math.floor(straightTotal / 2);
  const upperSteps = straightTotal - lowerSteps;

  const steps: Step[] = [];

  for (let i = 0; i < lowerSteps; i++) {
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

  const lastLowerZ = lowerSteps * tread;

  for (let i = 0; i < winderCount; i++) {
    const t = i / (winderCount - 1);
    const angle = t * (Math.PI / 2);
    const radius = tread * (0.6 + t * 0.8);
    const centerX = tread;
    const centerZ = lastLowerZ;

    const stepIndex = lowerSteps + i;
    const yPos = (stepIndex + 1) * rise;

    steps.push({
      index: stepIndex,
      x: centerX + Math.sin(angle) * radius,
      y: yPos,
      z: centerZ - Math.cos(angle) * radius + tread,
      rotationY: -angle,
      isWinder: true,
      treadDepth: tread,
      riseHeight: rise,
      width: input.stepWidth,
    });
  }

  const lastWinderX = steps[steps.length - 1].x;
  const lastWinderZ = steps[steps.length - 1].z;

  for (let i = 0; i < upperSteps; i++) {
    const stepIndex = lowerSteps + winderCount + i;
    const yPos = (stepIndex + 1) * rise;

    steps.push({
      index: stepIndex,
      x: lastWinderX + i * tread,
      y: yPos,
      z: lastWinderZ,
      rotationY: Math.PI / 2,
      isWinder: false,
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

  return {
    steps,
    totalSteps: steps.length,
    totalRise: input.floorHeight,
    inclination: Math.atan(rise / tread) * (180 / Math.PI),
    isValid: warnings.length === 0,
    warnings,
  };
}