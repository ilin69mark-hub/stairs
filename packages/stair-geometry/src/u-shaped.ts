import { StairInput, StairGeometry, Step } from './types';
import {
  calculateStepsCount,
  calculateTreadDepth,
  calculateInclination,
  validateSnip,
  validateInput,
  validateStepsConsistency,
  SNIP,
} from './utils';

/**
 * U-образная лестница с двумя поворотами на 180°.
 *
 * Оси: X — поперёк марша, Z — вдоль.
 * Все марши центрированы на x=0.
 * Повороты идут по дуге с pivot(0, pivotZ), radius = stepWidth/2.
 */
export function calculateUShaped(input: StairInput): StairGeometry {
  validateInput(input);

  const totalSteps = input.totalSteps ?? calculateStepsCount(input.floorHeight);
  const rise = input.floorHeight / totalSteps;
  const tread = calculateTreadDepth(rise);

  const winderPerTurn = Math.max(2, SNIP.WINDER_COUNT_U);
  const totalWinders = winderPerTurn * 2;
  const straightTotal = totalSteps - totalWinders;
  const lowerCount = Math.max(1, Math.floor(straightTotal / 3));
  const middleCount = Math.max(1, Math.floor(straightTotal / 3));
  const upperCount = straightTotal - lowerCount - middleCount;

  const steps: Step[] = [];
  const radius = input.stepWidth / 2;

  // ── Нижний марш: вдоль +Z ──
  for (let i = 0; i < lowerCount; i++) {
    steps.push({
      index: i,
      x: 0,
      y: (i + 1) * rise,
      z: (i + 0.5) * tread,
      rotationY: 0,
      isWinder: false,
      treadDepth: tread,
      riseHeight: rise,
      width: input.stepWidth,
      segment: 0,
    });
  }

  const lowerEndZ = lowerCount * tread;

  // ── Первый поворот на 180°: +Z → -Z через +X ──
  // Все ступени на дуге вокруг pivot (0, pivotZ1):
  //   x = -sin(angle) * radius
  //   z = pivotZ1 + (1 - cos(angle)) * radius
  //
  // pivotZ1 — центр дуги первого поворота.
  // При angle=0 центр первой забежной ступени совпадает
  // с задней гранью последней ступени нижнего марша.
  const pivotZ1 = lowerEndZ;

  for (let i = 0; i < winderPerTurn; i++) {
    const t = winderPerTurn > 1 ? (i + 0.5) / winderPerTurn : 0;
    const angle = t * Math.PI;
    const stepIndex = lowerCount + i;

    steps.push({
      index: stepIndex,
      x: -Math.sin(angle) * radius,
      y: (stepIndex + 1) * rise,
      z: pivotZ1 + (1 - Math.cos(angle)) * radius,
      rotationY: -angle,
      isWinder: true,
      treadDepth: tread,
      riseHeight: rise,
      width: input.stepWidth,
      segment: 1,
    });
  }

  const lastFirstWinderZ = steps[steps.length - 1].z;

  // ── Средний марш: вдоль -Z ──
  for (let i = 0; i < middleCount; i++) {
    const stepIndex = lowerCount + winderPerTurn + i;

    steps.push({
      index: stepIndex,
      x: 0,
      y: (stepIndex + 1) * rise,
      z: lastFirstWinderZ - (i + 1) * tread,
      rotationY: Math.PI,
      isWinder: false,
      treadDepth: tread,
      riseHeight: rise,
      width: input.stepWidth,
      segment: 3,
    });
  }

  // ── Второй поворот на 180°: -Z → +Z через -X ──
  // pivotZ2 — центр дуги второго поворота на tread/2 дальше
  // последней ступени среднего марша, чтобы первая забежная
  // ступень не совпадала z-координатой с последней прямой.
  const lastMiddleFlightZ = steps[steps.length - 1].z;
  const pivotZ2 = lastMiddleFlightZ + tread / 2;

  for (let i = 0; i < winderPerTurn; i++) {
    const t = winderPerTurn > 1 ? (i + 0.5) / winderPerTurn : 0;
    const angle = t * Math.PI;
    const stepIndex = lowerCount + winderPerTurn + middleCount + i;

    steps.push({
      index: stepIndex,
      x: -Math.sin(angle) * radius,
      y: (stepIndex + 1) * rise,
      z: pivotZ2 + (1 - Math.cos(angle)) * radius,
      rotationY: -angle - Math.PI,
      isWinder: true,
      treadDepth: tread,
      riseHeight: rise,
      width: input.stepWidth,
      segment: 1,
    });
  }

  const lastSecondWinderZ = steps[steps.length - 1].z;

  // ── Верхний марш: вдоль +Z ──
  for (let i = 0; i < upperCount; i++) {
    const stepIndex = lowerCount + totalWinders + middleCount + i;

    steps.push({
      index: stepIndex,
      x: 0,
      y: (stepIndex + 1) * rise,
      z: lastSecondWinderZ + (i + 1) * tread,
      rotationY: 0,
      isWinder: false,
      treadDepth: tread,
      riseHeight: rise,
      width: input.stepWidth,
      segment: 2,
    });
  }

  const totalRun = tread * (totalSteps - 1);
  const inclination = calculateInclination(input.floorHeight, totalRun);

  const validation = validateSnip(rise, tread, inclination, steps.length);
  const stepsValidation = validateStepsConsistency(steps, input.floorHeight);

  return {
    steps,
    totalSteps: steps.length,
    totalRise: input.floorHeight,
    inclination,
    isValid: validation.isValid && stepsValidation.isValid,
    warnings: [...validation.warnings, ...stepsValidation.warnings],
  };
}
