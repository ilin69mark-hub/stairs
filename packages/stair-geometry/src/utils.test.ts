import { 
  SNIP, 
  clamp, 
  calculateStepsCount, 
  calculateTreadDepth, 
  calculateInclination, 
  validateSnip 
} from './utils';

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