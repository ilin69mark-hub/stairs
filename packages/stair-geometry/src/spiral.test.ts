import { calculateSpiral } from './spiral';
import { StairInput } from './types';

describe('calculateSpiral', () => {
  test('calculates spiral stair geometry correctly', () => {
    const input: StairInput = {
      type: 'spiral',
      floorHeight: 2700,
      openingWidth: 1500,
      openingLength: 1500,
      stepWidth: 700,
    };

    const result = calculateSpiral(input);

    expect(result.totalSteps).toBeGreaterThanOrEqual(5);
    expect(result.totalRise).toBe(2700);
    expect(result.steps).toHaveLength(result.totalSteps);
  });

  test('all steps are marked as winder', () => {
    const input: StairInput = {
      type: 'spiral',
      floorHeight: 2400,
      openingWidth: 1400,
      openingLength: 1400,
      stepWidth: 650,
    };

    const result = calculateSpiral(input);

    result.steps.forEach(step => {
      expect(step.isWinder).toBe(true);
    });
  });

  test('step indices are sequential', () => {
    const input: StairInput = {
      type: 'spiral',
      floorHeight: 1800,
      openingWidth: 1200,
      openingLength: 1200,
      stepWidth: 600,
    };

    const result = calculateSpiral(input);

    result.steps.forEach((step, i) => {
      expect(step.index).toBe(i);
    });
  });

  test('y position increases with step index', () => {
    const input: StairInput = {
      type: 'spiral',
      floorHeight: 2100,
      openingWidth: 1300,
      openingLength: 1300,
      stepWidth: 650,
    };

    const result = calculateSpiral(input);
    const rise = result.steps[0].riseHeight;

    result.steps.forEach((step, i) => {
      expect(step.y).toBeCloseTo((i + 1) * rise, 1);
    });
  });

  test('last step y close to floor height', () => {
    const input: StairInput = {
      type: 'spiral',
      floorHeight: 2500,
      openingWidth: 1400,
      openingLength: 1400,
      stepWidth: 700,
    };

    const result = calculateSpiral(input);
    const lastStep = result.steps[result.steps.length - 1];

    expect(Math.abs(lastStep.y - input.floorHeight)).toBeLessThan(2);
  });

  test('all steps have same rise height', () => {
    const input: StairInput = {
      type: 'spiral',
      floorHeight: 2400,
      openingWidth: 1500,
      openingLength: 1500,
      stepWidth: 700,
    };

    const result = calculateSpiral(input);
    const firstRise = result.steps[0].riseHeight;

    result.steps.forEach(step => {
      expect(step.riseHeight).toBeCloseTo(firstRise, 5);
    });
  });

  test('inclination is 0 for spiral', () => {
    const input: StairInput = {
      type: 'spiral',
      floorHeight: 2700,
      openingWidth: 1500,
      openingLength: 1500,
      stepWidth: 700,
    };

    const result = calculateSpiral(input);

    expect(result.inclination).toBe(0);
  });

  test('steps have rotationY values', () => {
    const input: StairInput = {
      type: 'spiral',
      floorHeight: 2400,
      openingWidth: 1400,
      openingLength: 1400,
      stepWidth: 700,
    };

    const result = calculateSpiral(input);

    result.steps.forEach((step, i) => {
      if (i > 0) {
        expect(step.rotationY).toBeGreaterThan(result.steps[i - 1].rotationY);
      }
    });
  });

  test('handles different floor heights', () => {
    const testCases = [1800, 2400, 3000];

    testCases.forEach(floorHeight => {
      const input: StairInput = {
        type: 'spiral',
        floorHeight,
        openingWidth: 1400,
        openingLength: 1400,
        stepWidth: 700,
      };

      const result = calculateSpiral(input);
      expect(result.totalSteps).toBeGreaterThanOrEqual(5);
      expect(result.totalRise).toBe(floorHeight);
    });
  });

  test('steps are arranged in circular pattern', () => {
    const input: StairInput = {
      type: 'spiral',
      floorHeight: 2000,
      openingWidth: 1200,
      openingLength: 1200,
      stepWidth: 600,
    };

    const result = calculateSpiral(input);

    const distances = result.steps.map(step => Math.sqrt(step.x * step.x + step.z * step.z));
    const firstRadius = distances[0];
    
    distances.forEach(dist => {
      expect(dist).toBeCloseTo(firstRadius, 0);
    });
  });
});