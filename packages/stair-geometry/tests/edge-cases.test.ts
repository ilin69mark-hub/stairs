import { calculateStraight } from '../src/straight';
import { calculateLShaped } from '../src/l-shaped';
import { calculateUShaped } from '../src/u-shaped';
import { calculateSpiral } from '../src/spiral';
import { SNIP } from '../src/utils';

describe('Edge cases - calculateStraight', () => {
  test('throws for zero floorHeight', () => {
    expect(() =>
      calculateStraight({
        type: 'straight',
        floorHeight: 0,
        openingWidth: 1000,
        openingLength: 4500,
        stepWidth: 900,
      })
    ).toThrow('Invalid stair input');
  });

  test('throws for negative values', () => {
    expect(() =>
      calculateStraight({
        type: 'straight',
        floorHeight: -100,
        openingWidth: 1000,
        openingLength: 4500,
        stepWidth: 900,
      })
    ).toThrow('Invalid stair input');
  });

  test('handles minimum valid floorHeight', () => {
    const result = calculateStraight({
      type: 'straight',
      floorHeight: SNIP.MIN_FLOOR_HEIGHT,
      openingWidth: 1000,
      openingLength: 4500,
      stepWidth: 900,
    });
    expect(result.steps.length).toBeGreaterThanOrEqual(SNIP.MIN_STEPS_PER_MARCH);
  });

  test('handles maximum valid floorHeight', () => {
    const result = calculateStraight({
      type: 'straight',
      floorHeight: SNIP.MAX_FLOOR_HEIGHT,
      openingWidth: 1000,
      openingLength: 4500,
      stepWidth: 900,
    });
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.totalRise).toBe(SNIP.MAX_FLOOR_HEIGHT);
  });
});

describe('Edge cases - calculateLShaped', () => {
  test('throws for zero floorHeight', () => {
    expect(() =>
      calculateLShaped({
        type: 'l-shaped',
        floorHeight: 0,
        openingWidth: 1800,
        openingLength: 2500,
        stepWidth: 900,
      })
    ).toThrow('Invalid stair input');
  });

  test('handles minimum valid floorHeight', () => {
    const result = calculateLShaped({
      type: 'l-shaped',
      floorHeight: SNIP.MIN_FLOOR_HEIGHT,
      openingWidth: 1800,
      openingLength: 2500,
      stepWidth: 900,
    });
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.steps.some((s) => s.isWinder)).toBe(true);
  });

  test('all steps have valid y progression', () => {
    const result = calculateLShaped({
      type: 'l-shaped',
      floorHeight: 2800,
      openingWidth: 1800,
      openingLength: 2500,
      stepWidth: 900,
    });
    for (let i = 1; i < result.steps.length; i++) {
      expect(result.steps[i].y).toBeGreaterThan(result.steps[i - 1].y);
    }
  });
});

describe('Edge cases - calculateUShaped', () => {
  test('throws for zero floorHeight', () => {
    expect(() =>
      calculateUShaped({
        type: 'u-shaped',
        floorHeight: 0,
        openingWidth: 1800,
        openingLength: 4000,
        stepWidth: 900,
      })
    ).toThrow('Invalid stair input');
  });

  test('handles minimum valid floorHeight', () => {
    const result = calculateUShaped({
      type: 'u-shaped',
      floorHeight: SNIP.MIN_FLOOR_HEIGHT,
      openingWidth: 1800,
      openingLength: 4000,
      stepWidth: 900,
    });
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.steps.filter((s) => s.isWinder).length).toBeGreaterThanOrEqual(4);
  });

  test('all steps have valid y progression', () => {
    const result = calculateUShaped({
      type: 'u-shaped',
      floorHeight: 2800,
      openingWidth: 1800,
      openingLength: 4000,
      stepWidth: 900,
    });
    for (let i = 1; i < result.steps.length; i++) {
      expect(result.steps[i].y).toBeGreaterThan(result.steps[i - 1].y);
    }
  });
});

describe('Edge cases - calculateSpiral', () => {
  test('throws for zero floorHeight', () => {
    expect(() =>
      calculateSpiral({
        type: 'spiral',
        floorHeight: 0,
        openingWidth: 1500,
        openingLength: 1500,
        stepWidth: 700,
      })
    ).toThrow('Invalid stair input');
  });

  test('handles minimum valid floorHeight', () => {
    const result = calculateSpiral({
      type: 'spiral',
      floorHeight: SNIP.MIN_FLOOR_HEIGHT,
      openingWidth: 1500,
      openingLength: 1500,
      stepWidth: 700,
    });
    expect(result.steps.length).toBeGreaterThanOrEqual(SNIP.SPIRAL_MIN_STEPS);
  });

  test('inclination is non-zero', () => {
    const result = calculateSpiral({
      type: 'spiral',
      floorHeight: 2800,
      openingWidth: 1500,
      openingLength: 1500,
      stepWidth: 700,
    });
    expect(result.inclination).toBeGreaterThan(0);
  });

  test('all steps have valid y progression', () => {
    const result = calculateSpiral({
      type: 'spiral',
      floorHeight: 2800,
      openingWidth: 1500,
      openingLength: 1500,
      stepWidth: 700,
    });
    for (let i = 1; i < result.steps.length; i++) {
      expect(result.steps[i].y).toBeGreaterThan(result.steps[i - 1].y);
    }
  });

  test('handles very small openingWidth (radius clamped to minimum)', () => {
    const result = calculateSpiral({
      type: 'spiral',
      floorHeight: 2800,
      openingWidth: 500,
      openingLength: 500,
      stepWidth: 700,
    });
    expect(result.steps.length).toBeGreaterThanOrEqual(SNIP.SPIRAL_MIN_STEPS);
    const firstStep = result.steps[0];
    const radius = Math.sqrt(firstStep.x * firstStep.x + firstStep.z * firstStep.z);
    expect(radius).toBeGreaterThanOrEqual(SNIP.SPIRAL_MIN_RADIUS);
  });
});
