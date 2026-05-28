import { calculateGeometry } from '../src/index';
import { StairInput } from '../src/types';

describe('calculateGeometry', () => {
  test('calculates straight stairs', () => {
    const input: StairInput = {
      type: 'straight',
      floorHeight: 2800,
      openingWidth: 1000,
      openingLength: 4500,
      stepWidth: 900,
    };
    const result = calculateGeometry(input);
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.totalRise).toBe(2800);
  });

  test('calculates l-shaped stairs', () => {
    const input: StairInput = {
      type: 'l-shaped',
      floorHeight: 2800,
      openingWidth: 1800,
      openingLength: 2500,
      stepWidth: 900,
    };
    const result = calculateGeometry(input);
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.steps.some((s) => s.isWinder)).toBe(true);
  });

  test('calculates u-shaped stairs', () => {
    const input: StairInput = {
      type: 'u-shaped',
      floorHeight: 2800,
      openingWidth: 1800,
      openingLength: 4000,
      stepWidth: 900,
    };
    const result = calculateGeometry(input);
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.steps.filter((s) => s.isWinder).length).toBeGreaterThanOrEqual(6);
  });

  test('calculates spiral stairs', () => {
    const input: StairInput = {
      type: 'spiral',
      floorHeight: 2800,
      openingWidth: 1500,
      openingLength: 1500,
      stepWidth: 700,
    };
    const result = calculateGeometry(input);
    expect(result.steps.length).toBeGreaterThanOrEqual(5);
    expect(result.steps.every((s) => s.isWinder)).toBe(true);
  });
});
