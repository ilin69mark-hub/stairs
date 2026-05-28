import {
  clamp,
  calculateStepsCount,
  calculateTreadDepth,
  calculateInclination,
  validateSnip,
  validateInput,
  validateStepsConsistency,
  SNIP,
} from '../src/utils';
import { StairInput, Step } from '../src/types';

describe('clamp', () => {
  test('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  test('returns min when value is below', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  test('returns max when value is above', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe('calculateStepsCount', () => {
  test('returns reasonable steps for 2800mm height', () => {
    const steps = calculateStepsCount(2800);
    expect(steps).toBeGreaterThanOrEqual(SNIP.MIN_STEPS_PER_MARCH);
    expect(steps).toBeLessThanOrEqual(30);
  });

  test('returns minimum steps for very low height', () => {
    const steps = calculateStepsCount(500);
    expect(steps).toBe(SNIP.MIN_STEPS_PER_MARCH);
  });

  test('returns more steps for taller height', () => {
    const low = calculateStepsCount(2000);
    const high = calculateStepsCount(4000);
    expect(high).toBeGreaterThan(low);
  });

  test('rise per step stays within SNIP range', () => {
    for (const height of [1000, 2000, 2800, 3500, 4500]) {
      const steps = calculateStepsCount(height);
      const rise = height / steps;
      expect(rise).toBeGreaterThanOrEqual(SNIP.MIN_RISE);
      expect(rise).toBeLessThanOrEqual(SNIP.MAX_RISE);
    }
  });
});

describe('calculateTreadDepth', () => {
  test('returns tread within SNIP range for ideal rise', () => {
    const tread = calculateTreadDepth(SNIP.IDEAL_RISE);
    expect(tread).toBeGreaterThanOrEqual(SNIP.MIN_TREAD);
    expect(tread).toBeLessThanOrEqual(SNIP.MAX_TREAD);
  });

  test('tread decreases as rise increases', () => {
    const lowRise = calculateTreadDepth(SNIP.MIN_RISE);
    const highRise = calculateTreadDepth(SNIP.MAX_RISE);
    expect(highRise).toBeLessThan(lowRise);
  });
});

describe('calculateInclination', () => {
  test('returns 0 for zero run', () => {
    expect(calculateInclination(3000, 0)).toBe(0);
  });

  test('returns reasonable angle for typical stairs', () => {
    const angle = calculateInclination(2800, 3500);
    expect(angle).toBeGreaterThan(30);
    expect(angle).toBeLessThan(45);
  });

  test('steeper stairs have higher inclination', () => {
    const shallow = calculateInclination(2000, 4000);
    const steep = calculateInclination(3000, 2000);
    expect(steep).toBeGreaterThan(shallow);
  });
});

describe('validateSnip', () => {
  test('returns valid for ideal values', () => {
    const result = validateSnip(175, 270, 35, 16);
    expect(result.isValid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  test('warns for rise outside range', () => {
    const result = validateSnip(100, 290, 35, 16);
    expect(result.isValid).toBe(false);
    expect(result.warnings.some((w) => w.includes('Rise'))).toBe(true);
  });

  test('warns for tread outside range', () => {
    const result = validateSnip(175, 200, 35, 16);
    expect(result.isValid).toBe(false);
    expect(result.warnings.some((w) => w.includes('Tread'))).toBe(true);
  });

  test('warns for inclination outside range', () => {
    const result = validateSnip(175, 290, 50, 16);
    expect(result.isValid).toBe(false);
    expect(result.warnings.some((w) => w.includes('Inclination'))).toBe(true);
  });

  test('warns for steps below minimum', () => {
    const result = validateSnip(175, 290, 35, 1);
    expect(result.isValid).toBe(false);
    expect(result.warnings.some((w) => w.includes('Step count'))).toBe(true);
  });
});

describe('validateInput', () => {
  test('accepts valid input', () => {
    const input: StairInput = {
      type: 'straight',
      floorHeight: 2800,
      openingWidth: 1000,
      openingLength: 4500,
      stepWidth: 900,
    };
    expect(() => validateInput(input)).not.toThrow();
  });

  test('throws for zero floorHeight', () => {
    const input: StairInput = {
      type: 'straight',
      floorHeight: 0,
      openingWidth: 1000,
      openingLength: 4500,
      stepWidth: 900,
    };
    expect(() => validateInput(input)).toThrow('Invalid stair input');
  });

  test('throws for negative stepWidth', () => {
    const input: StairInput = {
      type: 'straight',
      floorHeight: 2800,
      openingWidth: 1000,
      openingLength: 4500,
      stepWidth: -100,
    };
    expect(() => validateInput(input)).toThrow('Invalid stair input');
  });

  test('throws for too small openingWidth', () => {
    const input: StairInput = {
      type: 'straight',
      floorHeight: 2800,
      openingWidth: 100,
      openingLength: 4500,
      stepWidth: 900,
    };
    expect(() => validateInput(input)).toThrow('Invalid stair input');
  });

  test('throws for too large floorHeight', () => {
    const input: StairInput = {
      type: 'straight',
      floorHeight: 10000,
      openingWidth: 1000,
      openingLength: 4500,
      stepWidth: 900,
    };
    expect(() => validateInput(input)).toThrow('Invalid stair input');
  });
});

describe('validateStepsConsistency', () => {
  test('returns valid for sequential steps', () => {
    const steps: Step[] = [
      { index: 0, x: 0, y: 175, z: 0, rotationY: 0, isWinder: false, treadDepth: 290, riseHeight: 175, width: 900 },
      { index: 1, x: 0, y: 350, z: 290, rotationY: 0, isWinder: false, treadDepth: 290, riseHeight: 175, width: 900 },
    ];
    const result = validateStepsConsistency(steps, 350);
    expect(result.isValid).toBe(true);
  });

  test('warns for non-sequential indices', () => {
    const steps: Step[] = [
      { index: 0, x: 0, y: 175, z: 0, rotationY: 0, isWinder: false, treadDepth: 290, riseHeight: 175, width: 900 },
      { index: 2, x: 0, y: 350, z: 290, rotationY: 0, isWinder: false, treadDepth: 290, riseHeight: 175, width: 900 },
    ];
    const result = validateStepsConsistency(steps, 350);
    expect(result.isValid).toBe(false);
    expect(result.warnings.some((w) => w.includes('indices'))).toBe(true);
  });

  test('warns for mismatched floor height', () => {
    const steps: Step[] = [
      { index: 0, x: 0, y: 175, z: 0, rotationY: 0, isWinder: false, treadDepth: 290, riseHeight: 175, width: 900 },
      { index: 1, x: 0, y: 300, z: 290, rotationY: 0, isWinder: false, treadDepth: 290, riseHeight: 175, width: 900 },
    ];
    const result = validateStepsConsistency(steps, 350);
    expect(result.isValid).toBe(false);
    expect(result.warnings.some((w) => w.includes('floor height'))).toBe(true);
  });
});
