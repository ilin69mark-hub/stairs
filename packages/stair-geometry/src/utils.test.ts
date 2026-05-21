import { 
  SNIP, 
  clamp, 
  calculateStepsCount, 
  calculateTreadDepth, 
  calculateInclination, 
  validateSnip,
  validateWinderSteps,
  validateStairWidth,
  validateStairInput
} from './utils';
import { StairInput } from './types';

describe('SNIP constants', () => {
  test('has all required constants', () => {
    expect(SNIP.MIN_RISE).toBe(150);
    expect(SNIP.MAX_RISE).toBe(200);
    expect(SNIP.IDEAL_RISE).toBe(175);
    expect(SNIP.MIN_TREAD).toBe(250);
    expect(SNIP.MAX_TREAD).toBe(350);
    expect(SNIP.MIN_INCLINATION).toBe(30);
    expect(SNIP.MAX_INCLINATION).toBe(45);
    expect(SNIP.COMFORT_FORMULA).toBe(620);
    expect(SNIP.COMFORT_TOLERANCE).toBe(20);
    expect(SNIP.MIN_STEPS_PER_MARCH).toBe(3);
    expect(SNIP.WINDER_COUNT_L).toBe(3);
    expect(SNIP.WINDER_COUNT_U).toBe(3);
  });
});

describe('clamp', () => {
  test('clamps value within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe('calculateStepsCount', () => {
  test('calculates correct step count for typical floor height', () => {
    const steps = calculateStepsCount(2700);
    expect(steps).toBeGreaterThanOrEqual(3);
    const rise = 2700 / steps;
    expect(rise).toBeLessThanOrEqual(SNIP.MAX_RISE);
  });
  
  test('returns minimum steps for low floor heights', () => {
    const steps = calculateStepsCount(400);
    expect(steps).toBeGreaterThanOrEqual(3);
  });
  
  test('adjusts steps to meet minimum requirement', () => {
    const steps = calculateStepsCount(200);
    expect(steps).toBeGreaterThanOrEqual(3);
  });
});

describe('calculateTreadDepth', () => {
  test('calculates tread depth using comfort formula', () => {
    const tread = calculateTreadDepth(170);
    expect(tread).toBe(280);
  });
  
  test('clamps tread depth to minimum', () => {
    const tread = calculateTreadDepth(210);
    expect(tread).toBe(SNIP.MIN_TREAD);
  });
  
  test('clamps tread depth to maximum', () => {
    const tread = calculateTreadDepth(80);
    expect(tread).toBe(SNIP.MAX_TREAD);
  });
});

describe('calculateInclination', () => {
  test('calculates correct inclination angle', () => {
    const angle = calculateInclination(1500, 3000);
    expect(angle).toBeCloseTo(26.56, 1);
  });
  
  test('returns 0 for zero run', () => {
    expect(calculateInclination(2700, 0)).toBe(0);
  });
});

describe('validateSnip', () => {
  test('warns for rise below minimum', () => {
    const result = validateSnip(140, 280, 35, 15);
    expect(result.warnings.some(w => w.includes('Rise'))).toBe(true);
  });
  
  test('warns for rise above maximum', () => {
    const result = validateSnip(210, 250, 35, 15);
    expect(result.warnings.some(w => w.includes('Rise'))).toBe(true);
  });
  
  test('warns for tread outside range', () => {
    const result = validateSnip(175, 200, 35, 15);
    expect(result.warnings.some(w => w.includes('Tread'))).toBe(true);
  });
  
  test('warns for inclination outside range', () => {
    const result = validateSnip(175, 270, 25, 15);
    expect(result.warnings.some(w => w.includes('Inclination'))).toBe(true);
  });
  
  test('warns for insufficient steps', () => {
    const result = validateSnip(175, 280, 35, 2);
    expect(result.warnings.some(w => w.includes('Step count'))).toBe(true);
  });

  test('returns warnings for multiple violations', () => {
    const result = validateSnip(140, 200, 25, 2);
    expect(result.warnings.length).toBeGreaterThan(1);
    expect(result.isValid).toBe(false);
  });
});

describe('validateWinderSteps', () => {
  test('returns no warnings for valid winder steps', () => {
    const steps = [
      { index: 0, isWinder: true, width: 1000, treadDepth: 270 },
      { index: 1, isWinder: true, width: 1000, treadDepth: 270 },
    ];
    const warnings = validateWinderSteps(steps);
    expect(warnings.length).toBe(0);
  });

  test('warns for narrow winder width', () => {
    const steps = [
      { index: 0, isWinder: true, width: 200, treadDepth: 270 },
    ];
    const warnings = validateWinderSteps(steps);
    expect(warnings.some(w => w.includes('narrow width'))).toBe(true);
  });

  test('warns for small center winder width', () => {
    const steps = [
      { index: 0, isWinder: true, width: 300, treadDepth: 270 },
    ];
    const warnings = validateWinderSteps(steps);
    expect(warnings.some(w => w.includes('center width'))).toBe(true);
  });

  test('ignores non-winder steps', () => {
    const steps = [
      { index: 0, isWinder: false, width: 100, treadDepth: 270 },
    ];
    const warnings = validateWinderSteps(steps);
    expect(warnings.length).toBe(0);
  });
});

describe('validateStairWidth', () => {
  test('returns no warnings for valid width', () => {
    expect(validateStairWidth(1000).length).toBe(0);
  });

  test('warns for narrow width', () => {
    const warnings = validateStairWidth(800);
    expect(warnings.length).toBe(1);
    expect(warnings[0]).toContain('below minimum');
  });

  test('accepts minimum width', () => {
    expect(validateStairWidth(SNIP.MIN_STAIR_WIDTH).length).toBe(0);
  });
});

describe('validateStairInput', () => {
  test('returns no warnings for valid input', () => {
    const input: StairInput = {
      type: 'straight',
      floorHeight: 2700,
      openingWidth: 1200,
      openingLength: 2000,
      stepWidth: 1000,
    };
    expect(validateStairInput(input).length).toBe(0);
  });

  test('warns for negative floor height', () => {
    const input: StairInput = {
      type: 'straight',
      floorHeight: -100,
      openingWidth: 1200,
      openingLength: 2000,
      stepWidth: 1000,
    };
    const warnings = validateStairInput(input);
    expect(warnings.some(w => w.includes('Floor height'))).toBe(true);
  });

  test('warns for zero floor height', () => {
    const input: StairInput = {
      type: 'straight',
      floorHeight: 0,
      openingWidth: 1200,
      openingLength: 2000,
      stepWidth: 1000,
    };
    const warnings = validateStairInput(input);
    expect(warnings.some(w => w.includes('Floor height'))).toBe(true);
  });

  test('warns for unusually small floor height', () => {
    const input: StairInput = {
      type: 'straight',
      floorHeight: 500,
      openingWidth: 1200,
      openingLength: 2000,
      stepWidth: 1000,
    };
    const warnings = validateStairInput(input);
    expect(warnings.some(w => w.includes('unusually small'))).toBe(true);
  });

  test('warns for unusually large floor height', () => {
    const input: StairInput = {
      type: 'straight',
      floorHeight: 6000,
      openingWidth: 1200,
      openingLength: 2000,
      stepWidth: 1000,
    };
    const warnings = validateStairInput(input);
    expect(warnings.some(w => w.includes('unusually large'))).toBe(true);
  });

  test('warns for narrow opening width', () => {
    const input: StairInput = {
      type: 'straight',
      floorHeight: 2700,
      openingWidth: 500,
      openingLength: 2000,
      stepWidth: 1000,
    };
    const warnings = validateStairInput(input);
    expect(warnings.some(w => w.includes('below minimum passage width'))).toBe(true);
  });

  test('warns for negative opening width', () => {
    const input: StairInput = {
      type: 'straight',
      floorHeight: 2700,
      openingWidth: -100,
      openingLength: 2000,
      stepWidth: 1000,
    };
    const warnings = validateStairInput(input);
    expect(warnings.some(w => w.includes('must be positive'))).toBe(true);
  });

  test('warns for negative step width', () => {
    const input: StairInput = {
      type: 'straight',
      floorHeight: 2700,
      openingWidth: 1200,
      openingLength: 2000,
      stepWidth: -500,
    };
    const warnings = validateStairInput(input);
    expect(warnings.some(w => w.includes('must be positive'))).toBe(true);
  });
});

describe('boundary values', () => {
  test('calculateStepsCount for minimum floor height', () => {
    const steps = calculateStepsCount(450);
    expect(steps).toBe(SNIP.MIN_STEPS_PER_MARCH);
  });

  test('calculateStepsCount for maximum reasonable floor height', () => {
    const steps = calculateStepsCount(5000);
    const rise = 5000 / steps;
    expect(rise).toBeLessThanOrEqual(SNIP.MAX_RISE);
    expect(rise).toBeGreaterThanOrEqual(SNIP.MIN_RISE);
  });

  test('calculateTreadDepth at rise boundaries', () => {
    const treadAtMinRise = calculateTreadDepth(SNIP.MIN_RISE);
    expect(treadAtMinRise).toBeLessThanOrEqual(SNIP.MAX_TREAD);
    expect(treadAtMinRise).toBeGreaterThanOrEqual(SNIP.MIN_TREAD);

    const treadAtMaxRise = calculateTreadDepth(SNIP.MAX_RISE);
    expect(treadAtMaxRise).toBeLessThanOrEqual(SNIP.MAX_TREAD);
    expect(treadAtMaxRise).toBeGreaterThanOrEqual(SNIP.MIN_TREAD);
  });

  test('calculateInclination at extreme ratios', () => {
    const steepAngle = calculateInclination(3000, 2000);
    expect(steepAngle).toBeGreaterThan(45);

    const shallowAngle = calculateInclination(1500, 4000);
    expect(shallowAngle).toBeLessThan(30);
  });
});