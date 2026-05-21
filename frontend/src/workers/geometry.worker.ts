import type { StairInput, StairGeometry, Step, StairType } from '@/types';

const IDEAL_RISE = 175;
const MIN_RISE = 150;
const MAX_RISE = 200;
const MIN_TREAD = 250;
const MAX_TREAD = 350;
const COMFORT_FORMULA = 620;
const MIN_STEPS = 3;
const WINDER_RADIUS_FACTOR = 0.8;
const WINDER_RADIUS_MIN_FACTOR = 0.6;
const U_SHAPED_TURN_OFFSET_FACTOR = 1.0;
const SPIRAL_IDEAL_RISE = 190;
const SPIRAL_MIN_STEPS = 5;
const SPIRAL_RADIUS_FACTOR = 0.8;
const SPIRAL_RADIUS_OFFSET = 100;
const SPIRAL_MIN_RADIUS = 200;
const MIN_WINDER_WIDTH_NARROW = 100;
const MIN_WINDER_WIDTH_CENTER = 200;
const MIN_STAIR_WIDTH = 900;

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

function validateSnip(
  rise: number,
  tread: number,
  inclination: number,
  stepsCount: number
): string[] {
  const warnings: string[] = [];
  
  if (rise < MIN_RISE || rise > MAX_RISE) {
    warnings.push(`Rise ${rise}mm is outside SNIP range (${MIN_RISE}-${MAX_RISE}mm)`);
  }
  
  if (tread < MIN_TREAD || tread > MAX_TREAD) {
    warnings.push(`Tread ${tread}mm is outside SNIP range (${MIN_TREAD}-${MAX_TREAD}mm)`);
  }
  
  if (inclination < 30 || inclination > 45) {
    warnings.push(`Inclination ${inclination.toFixed(1)}° is outside SNIP range (30-45°)`);
  }
  
  if (stepsCount < MIN_STEPS) {
    warnings.push(`Step count ${stepsCount} is below minimum ${MIN_STEPS}`);
  }
  
  const comfortValue = rise + 2 * tread;
  if (Math.abs(comfortValue - COMFORT_FORMULA) > 20) {
    warnings.push(`Comfort formula deviation: ${comfortValue} differs from ideal ${COMFORT_FORMULA} by more than 20`);
  }
  
  return warnings;
}

function validateWinderSteps(steps: Step[]): string[] {
  const warnings: string[] = [];
  const winderSteps = steps.filter(s => s.isWinder);
  
  for (const step of winderSteps) {
    const narrowWidth = step.width * 0.3;
    const centerWidth = step.width * 0.5;
    
    if (narrowWidth < MIN_WINDER_WIDTH_NARROW) {
      warnings.push(`Winder step ${step.index}: narrow width ${narrowWidth.toFixed(0)}mm is below minimum ${MIN_WINDER_WIDTH_NARROW}mm`);
    }
    
    if (centerWidth < MIN_WINDER_WIDTH_CENTER) {
      warnings.push(`Winder step ${step.index}: center width ${centerWidth.toFixed(0)}mm is below minimum ${MIN_WINDER_WIDTH_CENTER}mm`);
    }
  }
  
  return warnings;
}

function validateStairWidth(stepWidth: number): string[] {
  const warnings: string[] = [];
  if (stepWidth < MIN_STAIR_WIDTH) {
    warnings.push(`Stair width ${stepWidth}mm is below minimum ${MIN_STAIR_WIDTH}mm`);
  }
  return warnings;
}

function validateStairInput(input: StairInput): string[] {
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

  const warnings = [...validateSnip(rise, tread, inclination, totalSteps), ...validateStairWidth(input.stepWidth)];

  return {
    steps,
    totalSteps,
    totalRise: input.floorHeight,
    inclination,
    isValid: warnings.length === 0,
    warnings,
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
  const turnRadius = Math.max(tread * WINDER_RADIUS_FACTOR, input.openingLength * 0.3);

  for (let i = 0; i < winderCount; i++) {
    const t = (i + 1) / (winderCount + 1);
    const angle = t * Math.PI / 2;
    const radius = tread * (WINDER_RADIUS_MIN_FACTOR + t * (WINDER_RADIUS_FACTOR + WINDER_RADIUS_MIN_FACTOR));
    const centerX = turnRadius;
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

  const warnings = [
    ...validateSnip(rise, tread, Math.atan(rise / tread) * (180 / Math.PI), steps.length),
    ...validateWinderSteps(steps),
    ...validateStairWidth(input.stepWidth),
  ];

  return {
    steps,
    totalSteps: steps.length,
    totalRise: input.floorHeight,
    inclination: Math.atan(rise / tread) * (180 / Math.PI),
    isValid: warnings.length === 0,
    warnings,
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
  const turnRadius = Math.max(tread * WINDER_RADIUS_FACTOR, input.openingLength * 0.25);

  for (let i = 0; i < winderPerTurn; i++) {
    const t = (i + 1) / (winderPerTurn + 1);
    const angle = t * Math.PI;
    const radius = turnRadius;
    const centerX = turnRadius;
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
  const lateralOffset = turnRadius * U_SHAPED_TURN_OFFSET_FACTOR;

  for (let i = 0; i < segmentSteps; i++) {
    steps.push({
      index: segmentSteps + winderPerTurn + i,
      x: lateralOffset,
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
    const radius = turnRadius;
    const centerX = lateralOffset + turnRadius;
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

  const warnings = [
    ...validateSnip(rise, tread, Math.atan(rise / tread) * (180 / Math.PI), steps.length),
    ...validateWinderSteps(steps),
    ...validateStairWidth(input.stepWidth),
  ];

  return {
    steps,
    totalSteps: steps.length,
    totalRise: input.floorHeight,
    inclination: Math.atan(rise / tread) * (180 / Math.PI),
    isValid: warnings.length === 0,
    warnings,
  };
}

function calculateSpiral(input: StairInput): StairGeometry {
  const totalSteps = Math.max(SPIRAL_MIN_STEPS, Math.round(input.floorHeight / SPIRAL_IDEAL_RISE));
  const rise = input.floorHeight / totalSteps;
  
  const radiusX = Math.max(SPIRAL_MIN_RADIUS, input.openingWidth / 2 - SPIRAL_RADIUS_OFFSET);
  const radiusZ = input.openingLength > 0
    ? Math.max(SPIRAL_MIN_RADIUS, input.openingLength / 2 - SPIRAL_RADIUS_OFFSET)
    : radiusX;
  
  const totalAngle = 2 * Math.PI + (totalSteps / 10) * Math.PI;
  const anglePerStep = totalAngle / totalSteps;
  
  const treadAtLineOfTravel = radiusX * anglePerStep * SPIRAL_RADIUS_FACTOR;
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

  const warnings: string[] = [];
  
  if (radiusX < SPIRAL_MIN_RADIUS + 50) {
    warnings.push(`Spiral radius ${radiusX.toFixed(0)}mm is relatively small`);
  }
  
  warnings.push(...validateStairWidth(input.stepWidth));

  return {
    steps,
    totalSteps: steps.length,
    totalRise: input.floorHeight,
    inclination,
    isValid: warnings.length === 0,
    warnings,
  };
}

function calculateGeometry(input: StairInput): StairGeometry {
  const inputWarnings = validateStairInput(input);
  
  let result: StairGeometry;
  switch (input.type) {
    case 'straight':
      result = calculateStraight(input);
      break;
    case 'l-shaped':
      result = calculateLShaped(input);
      break;
    case 'u-shaped':
      result = calculateUShaped(input);
      break;
    case 'spiral':
      result = calculateSpiral(input);
      break;
    default:
      result = calculateStraight(input);
  }
  
  if (inputWarnings.length > 0) {
    result = {
      ...result,
      warnings: [...inputWarnings, ...result.warnings],
      isValid: false,
    };
  }
  
  return result;
}

self.onmessage = (e: MessageEvent<StairInput>) => {
  try {
    const result = calculateGeometry(e.data);
    postMessage({ success: true, data: result });
  } catch (error) {
    postMessage({ success: false, error: String(error) });
  }
};