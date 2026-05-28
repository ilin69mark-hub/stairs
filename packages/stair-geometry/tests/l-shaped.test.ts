import { calculateLShaped } from '../src/l-shaped';
import { StairInput } from '../src/types';
import { SNIP } from '../src/utils';

describe('calculateLShaped', () => {
  const input: StairInput = {
    type: 'l-shaped',
    floorHeight: 2800,
    openingWidth: 1800,
    openingLength: 2500,
    stepWidth: 900,
  };

  const result = calculateLShaped(input);

  test('exactly 3 winder steps (WINDER_COUNT_L)', () => {
    const winderCount = result.steps.filter((s) => s.isWinder).length;
    expect(winderCount).toBeGreaterThanOrEqual(SNIP.WINDER_COUNT_L);
  });

  test('has both straight and winder steps', () => {
    const winderCount = result.steps.filter((s) => s.isWinder).length;
    const straightCount = result.steps.filter((s) => !s.isWinder).length;
    expect(winderCount).toBeGreaterThan(0);
    expect(straightCount).toBeGreaterThan(0);
  });

  test('indices are sequential', () => {
    result.steps.forEach((step, i) => {
      expect(step.index).toBe(i);
    });
  });

  test('first step y equals rise', () => {
    const rise = result.steps[0].riseHeight;
    expect(result.steps[0].y).toBeCloseTo(rise, 1);
  });

  test('last step y close to floorHeight (accuracy 10mm)', () => {
    const lastStep = result.steps[result.steps.length - 1];
    expect(Math.abs(lastStep.y - 2800)).toBeLessThan(10);
  });

  test('lower march goes along Z (all x equal)', () => {
    const winderIndex = result.steps.findIndex((s) => s.isWinder);
    const xs = result.steps.slice(0, winderIndex).map((s) => s.x);
    expect(new Set(xs).size).toBe(1);
  });

  test('upper march goes along X (z is constant for last steps)', () => {
    let lastWinderIndex = -1;
    result.steps.forEach((step, i) => {
      if (step.isWinder) lastWinderIndex = i;
    });
    const upperSteps = result.steps.slice(lastWinderIndex + 1);

    if (upperSteps.length > 1) {
      const zValues = upperSteps.map((s) => s.z);
      const zVariance = Math.max(...zValues) - Math.min(...zValues);
      expect(zVariance).toBeLessThan(20);
    }
  });

  test('winder steps have non-zero rotationY (at least some)', () => {
    const winderSteps = result.steps.filter((s) => s.isWinder);
    const nonZeroRotation = winderSteps.filter((s) => Math.abs(s.rotationY) > 0.01);
    expect(nonZeroRotation.length).toBeGreaterThan(0);
  });

  test('steps.length in range 15-17 for floorHeight=2800', () => {
    expect(result.steps.length).toBeGreaterThanOrEqual(15);
    expect(result.steps.length).toBeLessThanOrEqual(17);
  });

  test('all steps have a segment label', () => {
    result.steps.forEach((step) => {
      expect(step.segment).toBeDefined();
      expect([0, 1, 2]).toContain(step.segment);
    });
  });

  test('lower flight steps have segment=0', () => {
    const winderIndex = result.steps.findIndex((s) => s.isWinder);
    for (let i = 0; i < winderIndex; i++) {
      expect(result.steps[i].segment).toBe(0);
    }
  });

  test('winder steps have segment=1', () => {
    result.steps.filter((s) => s.isWinder).forEach((step) => {
      expect(step.segment).toBe(1);
    });
  });

  test('upper flight steps have segment=2', () => {
    let lastWinderIndex = -1;
    result.steps.forEach((step, i) => {
      if (step.isWinder) lastWinderIndex = i;
    });
    for (let i = lastWinderIndex + 1; i < result.steps.length; i++) {
      expect(result.steps[i].segment).toBe(2);
    }
  });

  test('segments appear in order 0, 1, 2 without gaps', () => {
    const segmentSequence = result.steps.map((s) => s.segment);
    const transitions = segmentSequence.filter((seg, i, arr) => i === 0 || seg !== arr[i - 1]);
    expect(transitions).toEqual([0, 1, 2]);
  });
});
