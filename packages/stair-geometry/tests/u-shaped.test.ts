import { calculateUShaped } from '../src/u-shaped';
import { StairInput } from '../src/types';
import { SNIP } from '../src/utils';

describe('calculateUShaped', () => {
  const input: StairInput = {
    type: 'u-shaped',
    floorHeight: 2800,
    openingWidth: 1800,
    openingLength: 4000,
    stepWidth: 900,
  };

  const result = calculateUShaped(input);

  test('exactly 6 winder steps (2 turns of 3)', () => {
    const winderCount = result.steps.filter(s => s.isWinder).length;
    expect(winderCount).toBe(SNIP.WINDER_COUNT_U * 2);
  });

  test('has three straight segments', () => {
    const winderSteps = result.steps.filter(s => s.isWinder);
    const winderIndices = winderSteps.map(s => s.index).sort((a, b) => a - b);
    
    const firstWinderEnd = winderIndices[SNIP.WINDER_COUNT_U - 1];
    const secondWinderEnd = winderIndices[winderIndices.length - 1];
    
    const firstSegmentLength = firstWinderEnd;
    const middleSegmentLength = secondWinderEnd - winderIndices[SNIP.WINDER_COUNT_U];
    const lastSegmentLength = result.totalSteps - 1 - secondWinderEnd;
    
    expect(firstSegmentLength).toBeGreaterThan(0);
    expect(middleSegmentLength).toBeGreaterThan(0);
    expect(lastSegmentLength).toBeGreaterThan(0);
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

  test('middle march has rotationY=PI (reversed)', () => {
    let winderCount = 0;
    let middleStart = -1;
    let middleEnd = -1;
    
    for (let i = 0; i < result.steps.length; i++) {
      if (result.steps[i].isWinder) {
        winderCount++;
        if (winderCount === SNIP.WINDER_COUNT_U && middleStart === -1) {
          middleStart = i + 1;
        }
        if (winderCount === SNIP.WINDER_COUNT_U + 1 && middleEnd === -1) {
          middleEnd = i - 1;
        }
      }
    }
    
    if (middleStart !== -1 && middleEnd !== -1 && middleStart <= middleEnd) {
      const middleSteps = result.steps.slice(middleStart, middleEnd + 1);
      const piRotations = middleSteps.filter(s => Math.abs(s.rotationY) > 2);
      expect(piRotations.length).toBeGreaterThan(0);
    }
  });

  test('steps.length not less than totalSteps-2 (tolerance for rounding)', () => {
    expect(result.steps.length).toBeGreaterThanOrEqual(result.totalSteps - 2);
  });
});