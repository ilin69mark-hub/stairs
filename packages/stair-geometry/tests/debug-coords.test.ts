import { calculateStraight } from '../src/straight';
import { calculateLShaped } from '../src/l-shaped';
import { calculateUShaped } from '../src/u-shaped';
import { calculateSpiral } from '../src/spiral';
import { StairInput } from '../src/types';

function printSteps(title: string, steps: { index: number; x: number; y: number; z: number; rotationY: number; isWinder: boolean }[]) {
  console.log(`\n===== ${title} (${steps.length} steps) =====`);
  console.log('  i  |   x   |   y   |   z   | rotY  | winder');
  console.log('-----|-------|-------|-------|-------|--------');
  for (const s of steps) {
    const rx = s.x.toFixed(1).padStart(6);
    const ry = s.y.toFixed(1).padStart(6);
    const rz = s.z.toFixed(1).padStart(6);
    const rr = s.rotationY.toFixed(3).padStart(6);
    const rw = s.isWinder ? ' W' : '  ';
    console.log(`  ${String(s.index).padStart(2)} | ${rx} | ${ry} | ${rz} | ${rr} |${rw}`);
  }
}

test('debug straight coordinates', () => {
  const input: StairInput = { type: 'straight', floorHeight: 2800, openingWidth: 900, openingLength: 4500, stepWidth: 900 };
  const result = calculateStraight(input);
  printSteps('Straight', result.steps);
  expect(result.steps.length).toBeGreaterThan(0);
});

test('debug L-shaped coordinates', () => {
  const input: StairInput = { type: 'l-shaped', floorHeight: 2800, openingWidth: 900, openingLength: 3500, stepWidth: 900 };
  const result = calculateLShaped(input);
  printSteps('L-shaped', result.steps);
  expect(result.steps.length).toBeGreaterThan(0);
});

test('debug U-shaped coordinates', () => {
  const input: StairInput = { type: 'u-shaped', floorHeight: 2800, openingWidth: 900, openingLength: 4000, stepWidth: 900 };
  const result = calculateUShaped(input);
  printSteps('U-shaped', result.steps);
  expect(result.steps.length).toBeGreaterThan(0);
});

test('debug spiral coordinates', () => {
  const input: StairInput = { type: 'spiral', floorHeight: 2800, openingWidth: 1500, openingLength: 1500, stepWidth: 900 };
  const result = calculateSpiral(input);
  printSteps('Spiral', result.steps);
  expect(result.steps.length).toBeGreaterThan(0);
});
