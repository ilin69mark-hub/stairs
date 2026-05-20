import { StairInput, StairGeometry, Step } from './types';
import { calculateStepsCount, calculateTreadDepth } from './utils';
import { SNIP } from './utils';

export function calculateUShaped(input: StairInput): StairGeometry {
  const totalSteps = calculateStepsCount(input.floorHeight);
  const rise = input.floorHeight / totalSteps;
  const tread = calculateTreadDepth(rise);

  const winderPerTurn = SNIP.WINDER_COUNT_U;
  const totalWinders = winderPerTurn * 2;
  const straightTotal = totalSteps - totalWinders;
  const segmentSteps = Math.floor(straightTotal / 3);
  const upperSteps = straightTotal - segmentSteps * 2;

  const steps: Step[] = [];

  for (let i = 0; i < segmentSteps; i++) {
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

  const firstWinderZ = segmentSteps * tread;

  for (let i = 0; i < winderPerTurn; i++) {
    const t = i / (winderPerTurn - 1);
    const angle = t * Math.PI;
    const radius = tread * 0.8;
    const centerX = tread;
    const centerZ = firstWinderZ;

    const stepIndex = segmentSteps + i;
    const yPos = (stepIndex + 1) * rise;

    steps.push({
      index: stepIndex,
      x: centerX - Math.sin(angle) * radius,
      y: yPos,
      z: centerZ + (1 - Math.cos(angle)) * radius,
      rotationY: -angle,
      isWinder: true,
      treadDepth: tread,
      riseHeight: rise,
      width: input.stepWidth,
    });
  }

  const lastFirstWinderZ = steps[steps.length - 1].z;

  for (let i = 0; i < segmentSteps; i++) {
    const stepIndex = segmentSteps + winderPerTurn + i;
    const yPos = (stepIndex + 1) * rise;

    steps.push({
      index: stepIndex,
      x: 0,
      y: yPos,
      z: lastFirstWinderZ - (i + 1) * tread,
      rotationY: Math.PI,
      isWinder: false,
      treadDepth: tread,
      riseHeight: rise,
      width: input.stepWidth,
    });
  }

  const secondWinderZ = steps[steps.length - 1].z;

  for (let i = 0; i < winderPerTurn; i++) {
    const t = i / (winderPerTurn - 1);
    const angle = t * Math.PI;
    const radius = tread * 0.8;
    const centerX = tread;
    const centerZ = secondWinderZ;

    const stepIndex = segmentSteps + winderPerTurn + segmentSteps + i;
    const yPos = (stepIndex + 1) * rise;

    steps.push({
      index: stepIndex,
      x: centerX - Math.sin(angle) * radius,
      y: yPos,
      z: centerZ + (1 - Math.cos(angle)) * radius,
      rotationY: -angle - Math.PI,
      isWinder: true,
      treadDepth: tread,
      riseHeight: rise,
      width: input.stepWidth,
    });
  }

  const lastSecondWinderZ = steps[steps.length - 1].z;

  for (let i = 0; i < upperSteps; i++) {
    const stepIndex = segmentSteps + winderPerTurn + segmentSteps + winderPerTurn + i;
    const yPos = (stepIndex + 1) * rise;

    steps.push({
      index: stepIndex,
      x: 0,
      y: yPos,
      z: lastSecondWinderZ + (i + 1) * tread,
      rotationY: 0,
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