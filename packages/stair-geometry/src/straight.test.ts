import { calculateStraight } from './straight';
import { StairInput } from './types';

describe('calculateStraight', () => {
  test('calculates straight stair geometry correctly', () => {
    const input: StairInput = {
      type: 'straight',
      floorHeight: 2700,
      openingWidth: 900,
      openingLength: 4000,
      stepWidth: 800,
    };

    const result = calculateStraight(input);

    expect(result.totalSteps).toBeGreaterThanOrEqual(3);
    expect(result.totalRise).toBe(2700);
    expect(result.steps).toHaveLength(result.totalSteps);
    expect(result.inclination).toBeGreaterThan(0);
    expect(result.inclination).toBeLessThan(90);
  });

  test('generates steps with correct properties', () => {
    const input: StairInput = {
      type: 'straight',
      floorHeight: 2400,
      openingWidth: 800,
      openingLength: 3500,
      stepWidth: 750,
    };

    const result = calculateStraight(input);

    result.steps.forEach((step, i) => {
      expect(step.index).toBe(i);
      expect(step.x).toBe(0);
      expect(step.rotationY).toBe(0);
      expect(step.isWinder).toBe(false);
      expect(step.riseHeight).toBeGreaterThan(0);
      expect(step.treadDepth).toBeGreaterThan(0);
    });
  });

  test('calculates correct y position for each step', () => {
    const input: StairInput = {
      type: 'straight',
      floorHeight: 1800,
      openingWidth: 900,
      openingLength: 3000,
      stepWidth: 800,
    };

    const result = calculateStraight(input);
    const rise = result.steps[0].riseHeight;

    result.steps.forEach((step, i) => {
      expect(step.y).toBeCloseTo((i + 1) * rise, 1);
    });
  });

  test('calculates correct z position (run) for each step', () => {
    const input: StairInput = {
      type: 'straight',
      floorHeight: 2100,
      openingWidth: 850,
      openingLength: 3200,
      stepWidth: 800,
    };

    const result = calculateStraight(input);
    const tread = result.steps[0].treadDepth;

    result.steps.forEach((step, i) => {
      expect(step.z).toBeCloseTo(i * tread, 1);
    });
  });

  test('handles different floor heights', () => {
    const testCases = [
      { floorHeight: 1500, minSteps: 3 },
      { floorHeight: 2700, minSteps: 3 },
      { floorHeight: 3000, minSteps: 3 },
    ];

    testCases.forEach(({ floorHeight, minSteps }) => {
      const input: StairInput = {
        type: 'straight',
        floorHeight,
        openingWidth: 900,
        openingLength: 4000,
        stepWidth: 800,
      };

      const result = calculateStraight(input);
      expect(result.totalSteps).toBeGreaterThanOrEqual(minSteps);
      expect(result.totalRise).toBe(floorHeight);
    });
  });

  test('sets all steps width from input', () => {
    const stepWidth = 850;
    const input: StairInput = {
      type: 'straight',
      floorHeight: 2400,
      openingWidth: 900,
      openingLength: 3500,
      stepWidth,
    };

    const result = calculateStraight(input);

    result.steps.forEach(step => {
      expect(step.width).toBe(stepWidth);
    });
  });

  test('handles minimum floor height boundary', () => {
    const input: StairInput = {
      type: 'straight',
      floorHeight: 450,
      openingWidth: 900,
      openingLength: 2000,
      stepWidth: 900,
    };

    const result = calculateStraight(input);
    expect(result.totalSteps).toBeGreaterThanOrEqual(3);
    expect(result.steps.length).toBe(result.totalSteps);
  });

  test('handles maximum floor height boundary', () => {
    const input: StairInput = {
      type: 'straight',
      floorHeight: 5000,
      openingWidth: 1200,
      openingLength: 5000,
      stepWidth: 1000,
    };

    const result = calculateStraight(input);
    const rise = result.steps[0].riseHeight;
    expect(rise).toBeLessThanOrEqual(200);
    expect(rise).toBeGreaterThanOrEqual(150);
  });

  test('last step reaches floor height', () => {
    const input: StairInput = {
      type: 'straight',
      floorHeight: 2700,
      openingWidth: 900,
      openingLength: 4000,
      stepWidth: 800,
    };

    const result = calculateStraight(input);
    const lastStep = result.steps[result.steps.length - 1];
    expect(lastStep.y).toBeCloseTo(2700, 0);
  });

  test('step indices are sequential', () => {
    const input: StairInput = {
      type: 'straight',
      floorHeight: 3000,
      openingWidth: 1000,
      openingLength: 4000,
      stepWidth: 900,
    };

    const result = calculateStraight(input);
    result.steps.forEach((step, i) => {
      expect(step.index).toBe(i);
    });
  });
});