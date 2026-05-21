import { calculateLShaped } from './l-shaped';
import { StairInput } from './types';

describe('calculateLShaped', () => {
  test('calculates L-shaped stair geometry correctly', () => {
    const input: StairInput = {
      type: 'l-shaped',
      floorHeight: 2700,
      openingWidth: 1800,
      openingLength: 2500,
      stepWidth: 800,
    };

    const result = calculateLShaped(input);

    expect(result.totalSteps).toBeGreaterThanOrEqual(3);
    expect(result.totalRise).toBe(2700);
    expect(result.steps).toHaveLength(result.totalSteps);
  });

  test('has correct number of winder steps', () => {
    const input: StairInput = {
      type: 'l-shaped',
      floorHeight: 2400,
      openingWidth: 1500,
      openingLength: 2200,
      stepWidth: 750,
    };

    const result = calculateLShaped(input);
    const winderSteps = result.steps.filter(s => s.isWinder);

    expect(winderSteps.length).toBe(3);
  });

  test('winder steps are marked correctly', () => {
    const input: StairInput = {
      type: 'l-shaped',
      floorHeight: 2100,
      openingWidth: 1400,
      openingLength: 2000,
      stepWidth: 700,
    };

    const result = calculateLShaped(input);
    
    let firstWinderIndex = -1;
    let lastWinderIndex = -1;
    result.steps.forEach((step, i) => {
      if (step.isWinder) {
        if (firstWinderIndex === -1) firstWinderIndex = i;
        lastWinderIndex = i;
      }
    });

    expect(firstWinderIndex).toBeGreaterThan(0);
    expect(lastWinderIndex).toBeLessThan(result.steps.length - 1);
  });

  test('step indices are sequential', () => {
    const input: StairInput = {
      type: 'l-shaped',
      floorHeight: 1800,
      openingWidth: 1200,
      openingLength: 1800,
      stepWidth: 700,
    };

    const result = calculateLShaped(input);

    result.steps.forEach((step, i) => {
      expect(step.index).toBe(i);
    });
  });

  test('lower march has rotationY = 0', () => {
    const input: StairInput = {
      type: 'l-shaped',
      floorHeight: 2400,
      openingWidth: 1500,
      openingLength: 2200,
      stepWidth: 800,
    };

    const result = calculateLShaped(input);
    const winderIndex = result.steps.findIndex(s => s.isWinder);
    
    for (let i = 0; i < winderIndex; i++) {
      expect(result.steps[i].rotationY).toBe(0);
    }
  });

  test('upper march has rotationY = PI/2', () => {
    const input: StairInput = {
      type: 'l-shaped',
      floorHeight: 2400,
      openingWidth: 1500,
      openingLength: 2200,
      stepWidth: 800,
    };

    const result = calculateLShaped(input);
    
    let lastWinderIndex = -1;
    result.steps.forEach((step, i) => {
      if (step.isWinder) lastWinderIndex = i;
    });
    
    for (let i = lastWinderIndex + 1; i < result.steps.length; i++) {
      expect(result.steps[i].rotationY).toBeCloseTo(Math.PI / 2, 5);
    }
  });

  test('y position increases with step index', () => {
    const input: StairInput = {
      type: 'l-shaped',
      floorHeight: 2000,
      openingWidth: 1300,
      openingLength: 1900,
      stepWidth: 750,
    };

    const result = calculateLShaped(input);
    const rise = result.steps[0].riseHeight;

    result.steps.forEach((step, i) => {
      expect(step.y).toBeCloseTo((i + 1) * rise, 1);
    });
  });

  test('all steps have same rise height', () => {
    const input: StairInput = {
      type: 'l-shaped',
      floorHeight: 2700,
      openingWidth: 1600,
      openingLength: 2400,
      stepWidth: 800,
    };

    const result = calculateLShaped(input);
    const firstRise = result.steps[0].riseHeight;

    result.steps.forEach(step => {
      expect(step.riseHeight).toBeCloseTo(firstRise, 5);
    });
  });

  test('last step y close to floor height', () => {
    const input: StairInput = {
      type: 'l-shaped',
      floorHeight: 2200,
      openingWidth: 1400,
      openingLength: 2000,
      stepWidth: 750,
    };

    const result = calculateLShaped(input);
    const lastStep = result.steps[result.steps.length - 1];

    expect(Math.abs(lastStep.y - input.floorHeight)).toBeLessThan(2);
  });

  test('handles different floor heights', () => {
    const testCases = [1800, 2400, 3000];

    testCases.forEach(floorHeight => {
      const input: StairInput = {
        type: 'l-shaped',
        floorHeight,
        openingWidth: 1500,
        openingLength: 2200,
        stepWidth: 800,
      };

      const result = calculateLShaped(input);
      expect(result.totalSteps).toBeGreaterThanOrEqual(3);
      expect(result.totalRise).toBe(floorHeight);
    });
  });

  test('handles minimum floor height boundary', () => {
    const input: StairInput = {
      type: 'l-shaped',
      floorHeight: 525,
      openingWidth: 1200,
      openingLength: 1500,
      stepWidth: 900,
    };

    const result = calculateLShaped(input);
    expect(result.totalSteps).toBeGreaterThanOrEqual(3);
    expect(result.steps.filter(s => s.isWinder).length).toBe(3);
  });

  test('handles large opening length for turn radius', () => {
    const input: StairInput = {
      type: 'l-shaped',
      floorHeight: 3000,
      openingWidth: 1500,
      openingLength: 3000,
      stepWidth: 1000,
    };

    const result = calculateLShaped(input);
    const winderSteps = result.steps.filter(s => s.isWinder);
    expect(winderSteps.length).toBe(3);
    
    const firstWinder = winderSteps[0];
    expect(firstWinder.x).toBeGreaterThan(0);
  });

  test('winder steps have negative rotationY', () => {
    const input: StairInput = {
      type: 'l-shaped',
      floorHeight: 2700,
      openingWidth: 1500,
      openingLength: 2200,
      stepWidth: 800,
    };

    const result = calculateLShaped(input);
    const winderSteps = result.steps.filter(s => s.isWinder);
    
    winderSteps.forEach(step => {
      expect(step.rotationY).toBeLessThan(0);
      expect(step.rotationY).toBeGreaterThan(-Math.PI / 2);
    });
  });
});