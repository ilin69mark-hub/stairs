import type { StairInput, StairGeometry, Step, StairType } from '@/types';

const IDEAL_RISE = 175;
const MIN_RISE = 150;
const MAX_RISE = 200;
const MIN_TREAD = 250;
const MAX_TREAD = 350;
const COMFORT_FORMULA = 620;
const MIN_STEPS = 3;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function calculateStepsCount(floorHeight: number): number {
  let steps = Math.round(floorHeight / IDEAL_RISE);
  if (steps < MIN_STEPS) {
    steps = MIN_STEPS;
  }
  const rise = floorHeight / steps;
  if (rise < MIN_RISE) {
    steps = Math.ceil(floorHeight / MIN_RISE);
  } else if (rise > MAX_RISE) {
    steps = Math.ceil(floorHeight / MAX_RISE);
  }
  return Math.max(steps, MIN_STEPS);
}

function calculateTreadDepth(rise: number): number {
  const calculated = COMFORT_FORMULA - 2 * rise;
  return clamp(calculated, MIN_TREAD, MAX_TREAD);
}

function calculateInclination(floorHeight: number, totalRun: number): number {
  if (totalRun === 0) return 0;
  return Math.atan2(floorHeight, totalRun) * (180 / Math.PI);
}

function calculateStraight(input: StairInput): StairGeometry {
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

  return {
    steps,
    totalSteps,
    totalRise: input.floorHeight,
    inclination,
    isValid: true,
    warnings: [],
  };
}

function calculateLShaped(input: StairInput): StairGeometry {
  const totalSteps = calculateStepsCount(input.floorHeight);
  const rise = input.floorHeight / totalSteps;
  const tread = calculateTreadDepth(rise);

  const winderCount = 3;
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
    const t = (i + 1) / (winderCount + 1);
    const angle = t * Math.PI / 2;
    const radius = tread * (0.6 + t * 0.8);
    const centerX = tread;
    const centerZ = lastLowerZ;

    steps.push({
      index: lowerSteps + i,
      x: centerX + Math.sin(angle) * radius,
      y: (lowerSteps + i + 1) * rise,
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
    steps.push({
      index: lowerSteps + winderCount + i,
      x: lastWinderX + i * tread,
      y: (lowerSteps + winderCount + i + 1) * rise,
      z: lastWinderZ,
      rotationY: Math.PI / 2,
      isWinder: false,
      treadDepth: tread,
      riseHeight: rise,
      width: input.stepWidth,
    });
  }

  return {
    steps,
    totalSteps: steps.length,
    totalRise: input.floorHeight,
    inclination: calculateInclination(input.floorHeight, lastWinderX + upperSteps * tread),
    isValid: true,
    warnings: [],
  };
}

function calculateUShaped(input: StairInput): StairGeometry {
  const totalSteps = calculateStepsCount(input.floorHeight);
  const rise = input.floorHeight / totalSteps;
  const tread = calculateTreadDepth(rise);

  const winderPerTurn = 3;
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

  const firstWinderZ = (segmentSteps - 1) * tread;

  for (let i = 0; i < winderPerTurn; i++) {
    const t = (i + 1) / (winderPerTurn + 1);
    const angle = t * Math.PI;
    const radius = tread * 0.8;
    const centerX = tread;
    const centerZ = firstWinderZ;

    steps.push({
      index: segmentSteps + i,
      x: centerX - Math.sin(angle) * radius,
      y: (segmentSteps + i + 1) * rise,
      z: centerZ - Math.cos(angle) * radius + tread,
      rotationY: -angle,
      isWinder: true,
      treadDepth: tread,
      riseHeight: rise,
      width: input.stepWidth,
    });
  }

  const lastFirstWinderZ = steps[steps.length - 1].z;

  for (let i = 0; i < segmentSteps; i++) {
    steps.push({
      index: segmentSteps + winderPerTurn + i,
      x: 0,
      y: (segmentSteps + winderPerTurn + i + 1) * rise,
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
    const t = (i + 1) / (winderPerTurn + 1);
    const angle = t * Math.PI;
    const radius = tread * 0.8;
    const centerX = tread;
    const centerZ = secondWinderZ;

    steps.push({
      index: segmentSteps * 2 + winderPerTurn + i,
      x: centerX - Math.sin(angle) * radius,
      y: (segmentSteps * 2 + winderPerTurn + i + 1) * rise,
      z: centerZ - Math.cos(angle) * radius + tread,
      rotationY: -angle - Math.PI,
      isWinder: true,
      treadDepth: tread,
      riseHeight: rise,
      width: input.stepWidth,
    });
  }

  const lastSecondWinderZ = steps[steps.length - 1].z;

  for (let i = 0; i < upperSteps; i++) {
    steps.push({
      index: segmentSteps * 2 + winderPerTurn * 2 + i,
      x: 0,
      y: (segmentSteps * 2 + winderPerTurn * 2 + i + 1) * rise,
      z: lastSecondWinderZ + (i + 1) * tread,
      rotationY: 0,
      isWinder: false,
      treadDepth: tread,
      riseHeight: rise,
      width: input.stepWidth,
    });
  }

  return {
    steps,
    totalSteps: steps.length,
    totalRise: input.floorHeight,
    inclination: calculateInclination(input.floorHeight, steps[steps.length - 1].z),
    isValid: true,
    warnings: [],
  };
}

function calculateSpiral(input: StairInput): StairGeometry {
  const totalSteps = Math.max(5, Math.round(input.floorHeight / 190));
  const rise = input.floorHeight / totalSteps;
  const radius = Math.max(200, input.openingWidth / 2 - 100);

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

  return {
    steps,
    totalSteps,
    totalRise: input.floorHeight,
    inclination: 0,
    isValid: true,
    warnings: [],
  };
}

function calculateGeometry(input: StairInput): StairGeometry {
  switch (input.type) {
    case 'straight':
      return calculateStraight(input);
    case 'l-shaped':
      return calculateLShaped(input);
    case 'u-shaped':
      return calculateUShaped(input);
    case 'spiral':
      return calculateSpiral(input);
    default:
      return calculateStraight(input);
  }
}

self.onmessage = (e: MessageEvent<StairInput>) => {
  try {
    const result = calculateGeometry(e.data);
    postMessage({ success: true, data: result });
  } catch (error) {
    postMessage({ success: false, error: String(error) });
  }
};