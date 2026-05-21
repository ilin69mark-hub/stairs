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

  test('inclination is calculated for spiral', () => {
    const input: StairInput = {
      type: 'spiral',
      floorHeight: 2700,
      openingWidth: 1500,
      openingLength: 1500,
      stepWidth: 700,
    };

    const result = calculateSpiral(input);

    expect(result.inclination).toBeGreaterThan(0);
    expect(result.inclination).toBeLessThan(90);
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

  test('handles elliptical opening with different width and length', () => {
    const input: StairInput = {
      type: 'spiral',
      floorHeight: 2700,
      openingWidth: 1500,
      openingLength: 2000,
      stepWidth: 700,
    };

    const result = calculateSpiral(input);
    
    const firstStep = result.steps[0];
    const quarterStep = result.steps[Math.floor(result.totalSteps / 4)];
    
    expect(Math.abs(firstStep.x)).toBeGreaterThan(0);
    expect(Math.abs(quarterStep.z)).toBeGreaterThan(Math.abs(firstStep.z));
  });

  test('handles minimum opening width', () => {
    const input: StairInput = {
      type: 'spiral',
      floorHeight: 2700,
      openingWidth: 600,
      openingLength: 600,
      stepWidth: 700,
    };

    const result = calculateSpiral(input);
    expect(result.totalSteps).toBeGreaterThanOrEqual(5);
    
    const firstStep = result.steps[0];
    const radius = Math.sqrt(firstStep.x * firstStep.x + firstStep.z * firstStep.z);
    expect(radius).toBeGreaterThanOrEqual(200);
  });

  test('handles large floor height', () => {
    const input: StairInput = {
      type: 'spiral',
      floorHeight: 5000,
      openingWidth: 1800,
      openingLength: 1800,
      stepWidth: 800,
    };

    const result = calculateSpiral(input);
    const rise = result.steps[0].riseHeight;
    expect(rise).toBeLessThanOrEqual(200);
    expect(result.inclination).toBeGreaterThan(0);
  });

  test('rotationY increases monotonically', () => {
    const input: StairInput = {
      type: 'spiral',
      floorHeight: 2700,
      openingWidth: 1500,
      openingLength: 1500,
      stepWidth: 700,
    };

    const result = calculateSpiral(input);
    
    for (let i = 1; i < result.steps.length; i++) {
      expect(result.steps[i].rotationY).toBeGreaterThan(result.steps[i - 1].rotationY);
    }
  });
});