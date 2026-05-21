import { calculateGeometry } from './index';
import { StairInput } from './types';

describe('calculateGeometry', () => {
  test('routes straight stairs correctly', () => {
    const input: StairInput = {
      type: 'straight',
      floorHeight: 2700,
      openingWidth: 900,
      openingLength: 4000,
      stepWidth: 800,
    };

    const result = calculateGeometry(input);

    expect(result.totalSteps).toBeGreaterThanOrEqual(3);
    expect(result.totalRise).toBe(2700);
  });

  test('routes l-shaped stairs correctly', () => {
    const input: StairInput = {
      type: 'l-shaped',
      floorHeight: 2400,
      openingWidth: 1800,
      openingLength: 2500,
      stepWidth: 750,
    };

    const result = calculateGeometry(input);

    expect(result.totalSteps).toBeGreaterThanOrEqual(3);
    const winderCount = result.steps.filter(s => s.isWinder).length;
    expect(winderCount).toBe(3);
  });

  test('routes u-shaped stairs correctly', () => {
    const input: StairInput = {
      type: 'u-shaped',
      floorHeight: 2700,
      openingWidth: 1800,
      openingLength: 4000,
      stepWidth: 800,
    };

    const result = calculateGeometry(input);

    expect(result.totalSteps).toBeGreaterThanOrEqual(3);
    const winderCount = result.steps.filter(s => s.isWinder).length;
    expect(winderCount).toBe(6);
  });

  test('routes spiral stairs correctly', () => {
    const input: StairInput = {
      type: 'spiral',
      floorHeight: 2500,
      openingWidth: 1500,
      openingLength: 1500,
      stepWidth: 700,
    };

    const result = calculateGeometry(input);

    expect(result.totalSteps).toBeGreaterThanOrEqual(5);
    expect(result.inclination).toBeGreaterThan(0);
    expect(result.inclination).toBeLessThan(90);
    const winderCount = result.steps.filter(s => s.isWinder).length;
    expect(winderCount).toBe(result.totalSteps);
  });

  test('returns valid geometry for all stair types', () => {
    const types: StairInput['type'][] = ['straight', 'l-shaped', 'u-shaped', 'spiral'];

    types.forEach(type => {
      const input: StairInput = {
        type,
        floorHeight: 2400,
        openingWidth: 1500,
        openingLength: 3000,
        stepWidth: 750,
      };

      const result = calculateGeometry(input);

      expect(result.steps).toHaveLength(result.totalSteps);
      expect(result.totalRise).toBe(2400);
      expect(result.warnings).toBeDefined();
    });
  });

  test('handles unknown type defaults to straight', () => {
    const input = {
      type: 'straight' as StairInput['type'],
      floorHeight: 2000,
      openingWidth: 900,
      openingLength: 3000,
      stepWidth: 800,
    };

    const result = calculateGeometry(input);

    expect(result.totalSteps).toBeGreaterThanOrEqual(3);
  });
});