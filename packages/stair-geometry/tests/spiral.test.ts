import { calculateSpiral } from '../src/spiral';
import { StairInput } from '../src/types';

describe('calculateSpiral', () => {
  test('all steps are winder', () => {
    const input: StairInput = {
      type: 'spiral',
      floorHeight: 2800,
      openingWidth: 1500,
      openingLength: 1500,
      stepWidth: 700,
    };

    const result = calculateSpiral(input);

    result.steps.forEach((step) => {
      expect(step.isWinder).toBe(true);
    });
  });

  test('x and z lie on a circle (sqrt(x^2+z^2) approx equals radius)', () => {
    const input: StairInput = {
      type: 'spiral',
      floorHeight: 2400,
      openingWidth: 1600,
      openingLength: 1600,
      stepWidth: 700,
    };

    const result = calculateSpiral(input);
    const expectedRadius = input.openingWidth / 2 - 100;

    result.steps.forEach((step) => {
      const distance = Math.sqrt(step.x * step.x + step.z * step.z);
      expect(distance).toBeCloseTo(expectedRadius, 0);
    });
  });

  test('y increases uniformly', () => {
    const input: StairInput = {
      type: 'spiral',
      floorHeight: 2600,
      openingWidth: 1400,
      openingLength: 1400,
      stepWidth: 650,
    };

    const result = calculateSpiral(input);
    const rise = result.steps[0].riseHeight;

    result.steps.forEach((step, i) => {
      expect(step.y).toBeCloseTo((i + 1) * rise, 1);
    });
  });

  test('angles between steps are equal', () => {
    const input: StairInput = {
      type: 'spiral',
      floorHeight: 2200,
      openingWidth: 1300,
      openingLength: 1300,
      stepWidth: 600,
    };

    const result = calculateSpiral(input);

    const angles: number[] = [];
    result.steps.forEach((step) => {
      const angle = Math.atan2(step.z, step.x);
      angles.push(angle);
    });

    const angleDiffs: number[] = [];
    for (let i = 1; i < angles.length; i++) {
      let diff = angles[i] - angles[i - 1];
      if (diff < 0) diff += 2 * Math.PI;
      angleDiffs.push(diff);
    }

    const firstDiff = angleDiffs[0];
    angleDiffs.forEach((diff) => {
      expect(diff).toBeCloseTo(firstDiff, 1);
    });
  });

  test('radius ~650 for openingWidth=1500 (1500/2-100)', () => {
    const input: StairInput = {
      type: 'spiral',
      floorHeight: 2800,
      openingWidth: 1500,
      openingLength: 1500,
      stepWidth: 700,
    };

    const result = calculateSpiral(input);
    const expectedRadius = 1500 / 2 - 100;

    result.steps.forEach((step) => {
      const distance = Math.sqrt(step.x * step.x + step.z * step.z);
      expect(distance).toBeCloseTo(expectedRadius, 0);
    });
  });

  test('steps.length >= 5', () => {
    const input: StairInput = {
      type: 'spiral',
      floorHeight: 2800,
      openingWidth: 1500,
      openingLength: 1500,
      stepWidth: 700,
    };

    const result = calculateSpiral(input);

    expect(result.steps.length).toBeGreaterThanOrEqual(5);
  });
});
