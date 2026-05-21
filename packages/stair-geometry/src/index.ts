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
import { validateStairInput } from './utils';

export function calculateGeometry(input: StairInput): StairGeometry {
  const inputWarnings = validateStairInput(input);
  
  let result: StairGeometry;
  switch (input.type) {
    case 'straight':
      result = calculateStraight(input);
      break;
    case 'l-shaped':
      result = calculateLShaped(input);
      break;
    case 'u-shaped':
      result = calculateUShaped(input);
      break;
    case 'spiral':
      result = calculateSpiral(input);
      break;
    default:
      result = calculateStraight(input);
  }
  
  if (inputWarnings.length > 0) {
    result = {
      ...result,
      warnings: [...inputWarnings, ...result.warnings],
      isValid: false,
    };
  }
  
  return result;
}