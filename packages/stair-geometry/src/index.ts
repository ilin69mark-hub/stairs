export * from './types';
export * from './utils';
export { calculateStraight } from './straight';
export { calculateLShaped } from './l-shaped';
export { calculateUShaped } from './u-shaped';
export { calculateSpiral } from './spiral';

import { StairInput, StairGeometry } from './types';
import { calculateStraight } from './straight';
import { calculateLShaped } from './l-shaped';
import { calculateUShaped } from './u-shaped';
import { calculateSpiral } from './spiral';

export function calculateGeometry(input: StairInput): StairGeometry {
  switch (input.type) {
    case 'straight':
      return calculateStraight(input);
    case 'l-shaped':
      return calculateLShaped(input);
    case 'u-shaped':
      return calculateUShaped(input);
    case 'spiral':
      return calculateSpiral(input);
    default:
      return calculateStraight(input);
  }
}