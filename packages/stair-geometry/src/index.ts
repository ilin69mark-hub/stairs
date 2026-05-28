export * from './types';
export * from './utils';
export { calculateStraight } from './straight';
export { calculateLShaped } from './l-shaped';
export { calculateUShaped } from './u-shaped';
export { calculateSpiral } from './spiral';

import { StairInput, StairGeometry, StairType } from './types';
import { calculateStraight } from './straight';
import { calculateLShaped } from './l-shaped';
import { calculateUShaped } from './u-shaped';
import { calculateSpiral } from './spiral';

const calculators: Record<StairType, (input: StairInput) => StairGeometry> = {
  straight: calculateStraight,
  'l-shaped': calculateLShaped,
  'u-shaped': calculateUShaped,
  spiral: calculateSpiral,
};

/**
 * Calculates stair geometry based on input type.
 * Dispatches to the appropriate calculator function.
 * Throws on unknown stair type.
 */
export function calculateGeometry(input: StairInput): StairGeometry {
  const calculator = calculators[input.type];
  if (!calculator) {
    throw new Error(`Unknown stair type: ${(input as { type: string }).type}`);
  }
  return calculator(input);
}
