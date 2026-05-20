import { calculateUShaped } from './u-shaped';
import { StairInput } from './types';

describe('calculateUShaped', () => {
  test('calculates U-shaped stair geometry correctly', () => {
    const input: StairInput = {
      type: 'u-shaped',
      floorHeight: 2700,
      openingWidth: 1800,
      openingLength: 4000,
      stepWidth: 800,
    };

    const result = calculateUShaped(input);

    expect(result.totalSteps).toBeGreaterThanOrEqual(3);
    expect(result.totalRise).toBe(2700);
    expect(result.steps).toHaveLength(result.totalSteps);
  });

  test('has correct number of winder steps', () => {
    const input: StairInput = {
      type: 'u-shaped',
      floorHeight: 2400,
      openingWidth: 1500,
      openingLength: 3500,
      stepWidth: 750,
    };

    const result = calculateUShaped(input);
    const winderSteps = result.steps.filter(s => s.isWinder);

    expect(winderSteps.length).toBe(6);
  });

  test('step indices are sequential', () => {
    const input: StairInput = {
      type: 'u-shaped',
      floorHeight: 1800,
      openingWidth: 1200,
      openingLength: 3000,
      stepWidth: 700,
    };

    const result = calculateUShaped(input);

    result.steps.forEach((step, i) => {
      expect(step.index).toBe(i);
    });
  });

  test('y position increases with step index', () => {
    const input: StairInput = {
      type: 'u-shaped',
      floorHeight: 2400,
      openingWidth: 1400,
      openingLength: 3200,
      stepWidth: 750,
    };

    const result = calculateUShaped(input);
    const rise = result.steps[0].riseHeight;

    result.steps.forEach((step, i) => {
      expect(step.y).toBeCloseTo((i + 1) * rise, 1);
    });
  });

  test('last step y close to floor height', () => {
    const input: StairInput = {
      type: 'u-shaped',
      floorHeight: 2700,
      openingWidth: 1600,
      openingLength: 3800,
      stepWidth: 800,
    };

    const result = calculateUShaped(input);
    const lastStep = result.steps[result.steps.length - 1];

    expect(Math.abs(lastStep.y - input.floorHeight)).toBeLessThan(2);
  });

  test('all steps have same rise height', () => {
    const input: StairInput = {
      type: 'u-shaped',
      floorHeight: 2100,
      openingWidth: 1500,
      openingLength: 3400,
      stepWidth: 800,
    };

    const result = calculateUShaped(input);
    const firstRise = result.steps[0].riseHeight;

    result.steps.forEach(step => {
      expect(step.riseHeight).toBeCloseTo(firstRise, 5);
    });
  });

  test('winder steps have rotationY values', () => {
    const input: StairInput = {
      type: 'u-shaped',
      floorHeight: 2400,
      openingWidth: 1500,
      openingLength: 3500,
      stepWidth: 800,
    };

    const result = calculateUShaped(input);
    const winderSteps = result.steps.filter(s => s.isWinder);

    winderSteps.forEach(step => {
      expect(step.rotationY).not.toBe(0);
    });
  });

  test('handles different floor heights', () => {
    const testCases = [1800, 2400, 3000];

    testCases.forEach(floorHeight => {
      const input: StairInput = {
        type: 'u-shaped',
        floorHeight,
        openingWidth: 1500,
        openingLength: 3500,
        stepWidth: 800,
      };

      const result = calculateUShaped(input);
      expect(result.totalSteps).toBeGreaterThanOrEqual(3);
      expect(result.totalRise).toBe(floorHeight);
    });
  });
});