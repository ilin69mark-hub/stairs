import { calculateStraight } from '../src/straight';
import { StairInput } from '../src/types';

describe('calculateStraight', () => {
  const input: StairInput = {
    type: 'straight',
    floorHeight: 2800,
    openingWidth: 1000,
    openingLength: 4500,
    stepWidth: 900,
  };

  const result = calculateStraight(input);

  test('totalRise equals floorHeight', () => {
    expect(result.totalRise).toBe(2800);
  });

  test('steps.length equals totalSteps', () => {
    expect(result.steps.length).toBe(result.totalSteps);
  });

  test('indices are sequential 0..N-1', () => {
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

  test('all isWinder are false', () => {
    result.steps.forEach(step => {
      expect(step.isWinder).toBe(false);
    });
  });

  test('all x equal 0', () => {
    result.steps.forEach(step => {
      expect(step.x).toBe(0);
    });
  });

  test('z grows by tread increment', () => {
    const tread = result.steps[0].treadDepth;
    result.steps.forEach((step, i) => {
      expect(step.z).toBeCloseTo(i * tread, 1);
    });
  });

  test('rise heights between steps are equal', () => {
    const rise = result.steps[0].riseHeight;
    for (let i = 1; i < result.steps.length; i++) {
      const diff = result.steps[i].y - result.steps[i - 1].y;
      expect(diff).toBeCloseTo(rise, 5);
    }
  });
});