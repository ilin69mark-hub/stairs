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

const SEGMENT = { LOWER: 0, WINDER: 1, UPPER: 2 } as const;

interface SegmentEnd {
  x: number;
  z: number;
}

function buildLowerFlight(
  startIndex: number,
  tread: number,
  stepWidth: number,
  rise: number,
  count: number,
): Step[] {
  const steps: Step[] = [];
  for (let i = 0; i < count; i++) {
    steps.push({
      index: startIndex + i,
      // Нижний марш идёт вдоль оси Z (rotationY = 0)
      // Центр ступени по Z: (i + 0.5) * tread
      x: stepWidth / 2,
      y: (startIndex + i + 1) * rise,
      z: (i + 0.5) * tread,
      rotationY: 0,
      isWinder: false,
      treadDepth: tread,
      riseHeight: rise,
      width: stepWidth,
      segment: SEGMENT.LOWER,
    });
  }
  return steps;
}

/**
 * Забежные ступени — поворот на 90° (π/2) вокруг внутреннего угла.
 *
 * Система координат:
 *   - Внутренний угол поворота находится в точке (0, _, lastZ) где lastZ = lowerCount * tread
 *   - innerR — расстояние от внутреннего угла до внутреннего края ступени (обычно 0..150 мм)
 *   - outerR — расстояние от внутреннего угла до внешнего края ступени (= stepWidth)
 *   - Ступени раскладываются от angle=0 (направление вдоль Z, как нижний марш)
 *     до angle=π/2 (направление вдоль X, как верхний марш)
 *
 * Позиция центра ступени — середина дуги по средней линии (midR = (innerR + outerR) / 2).
 * rotationY — угол поворота ступени в пространстве (её нормаль смотрит под этим углом).
 *
 * winderInnerDist — длина проступи у внутреннего края (по дуге innerR на угол шага)
 * winderOuterDist — длина проступи у внешнего края (по дуге outerR на угол шага)
 */
function buildWinderTurn(
  startIndex: number,
  pivotX: number,   // X координата внутреннего угла
  pivotZ: number,   // Z координата внутреннего угла
  tread: number,
  stepWidth: number,
  rise: number,
  count: number,
): { steps: Step[]; end: SegmentEnd } {
  const steps: Step[] = [];
  if (count === 0) return { steps, end: { x: pivotX, z: pivotZ } };

  // Внутренний радиус — небольшой зазор (не 0, иначе ступени схлопываются)
  // Типовое значение: 50–100 мм, берём tread * 0.15 как разумное минимальное
  const innerR = Math.max(tread * 0.15, 50); // мм
  const outerR = stepWidth; // мм — внешний радиус = ширина марша
  const midR = (innerR + outerR) / 2;

  // Угловой шаг между ступенями
  // Поворот ровно на 90° (π/2), ступени делят его поровну
  const totalAngle = Math.PI / 2;
  const stepAngle = totalAngle / count; // каждая ступень занимает этот сектор

  for (let i = 0; i < count; i++) {
    // Угол к середине i-й ступени
    const midAngle = (i + 0.5) * stepAngle;

    // Угол поворота ступени (rotationY) = угол от оси Z:
    // при midAngle=0 ступень перпендикулярна Z (как нижний марш, rotationY=0)
    // при midAngle=π/2 ступень перпендикулярна X (как верхний марш, rotationY=π/2)
    const rotationY = midAngle;

    // Центр ступени по средней линии
    // Ось Z: от pivotZ прибавляем проекцию midR * cos(midAngle)
    // Ось X: от pivotX прибавляем проекцию midR * sin(midAngle)
    const cx = pivotX + midR * Math.sin(midAngle);
    const cz = pivotZ + midR * Math.cos(midAngle);

    // Длина проступи у внутреннего и внешнего края = дуга на угол stepAngle
    const innerDist = innerR * stepAngle; // мм
    const outerDist = outerR * stepAngle; // мм

    const stepIndex = startIndex + i;

    steps.push({
      index: stepIndex,
      x: cx,
      y: (stepIndex + 1) * rise,
      z: cz,
      rotationY,
      isWinder: true,
      treadDepth: tread,
      riseHeight: rise,
      width: stepWidth,
      segment: SEGMENT.WINDER,
      winderInnerDist: innerDist,
      winderOuterDist: outerDist,
      winderCount: count,
      winderTotalAngle: Math.PI / 2,
    });
  }

  // Конечная точка поворота — начало верхнего марша
  // После поворота на 90° верхний марш идёт вдоль оси X
  // Конец последней забежной ступени:
  const endAngle = totalAngle; // = π/2
  const end: SegmentEnd = {
    x: pivotX + outerR * Math.sin(endAngle), // = pivotX + outerR
    z: pivotZ + outerR * Math.cos(endAngle), // = pivotZ + 0 → pivotZ
  };

  return { steps, end };
}

/**
 * Верхний марш — идёт вдоль оси X (rotationY = π/2).
 * Начинается из точки end, которую вернул buildWinderTurn.
 * Ступени выровнены по Z = end.z, смещаются по X.
 */
function buildUpperFlight(
  startIndex: number,
  start: SegmentEnd,
  tread: number,
  stepWidth: number,
  rise: number,
  count: number,
): Step[] {
  const steps: Step[] = [];
  for (let i = 0; i < count; i++) {
    const stepIndex = startIndex + i;
    steps.push({
      index: stepIndex,
      // Центр ступени смещается по X от start.x
      x: start.x + (i + 0.5) * tread,
      y: (stepIndex + 1) * rise,
      z: start.z + stepWidth / 2,
      rotationY: Math.PI / 2,
      isWinder: false,
      treadDepth: tread,
      riseHeight: rise,
      width: stepWidth,
      segment: SEGMENT.UPPER,
    });
  }
  return steps;
}

export function calculateLShaped(input: StairInput): StairGeometry {
  validateInput(input);

  const totalSteps = input.totalSteps ?? calculateStepsCount(input.floorHeight);
  const rise = input.floorHeight / totalSteps;
  const tread = calculateTreadDepth(rise);

  const winderCount = SNIP.WINDER_COUNT_L;
  const straightTotal = totalSteps - winderCount;
  const lowerCount = input.lowerSteps ?? Math.floor(straightTotal / 2);
  const upperCount = straightTotal - lowerCount;

  const steps: Step[] = [];

  // Нижний марш
  const lowerFlight = buildLowerFlight(0, tread, input.stepWidth, rise, lowerCount);
  steps.push(...lowerFlight);

  // Внутренний угол поворота находится в конце нижнего марша
  // X = 0 (нижний марш по Z, X=0), Z = lowerCount * tread
  // Смещаем Z на innerR назад, чтобы ребро angle=0 первого клина
  // совпало с верхней гранью последней прямой ступени
  const innerR = Math.max(tread * 0.15, 50);
  const pivotX = 0;
  const pivotZ = lowerCount * tread - innerR;

  const winderResult = buildWinderTurn(
    lowerCount,
    pivotX,
    pivotZ,
    tread,
    input.stepWidth,
    rise,
    winderCount,
  );
  steps.push(...winderResult.steps);

  // Верхний марш — начинаем от координат последней забежной ступени
  const lastWinder = winderResult.steps[winderResult.steps.length - 1];
  const upperStart: SegmentEnd = {
    x: lastWinder.x,
    z: lastWinder.z,
  };
  const upperFlight = buildUpperFlight(
    lowerCount + winderCount,
    upperStart,
    tread,
    input.stepWidth,
    rise,
    upperCount,
  );
  steps.push(...upperFlight);

  // Зеркалирование для правого поворота
  if (input.direction === 'right') {
    for (const step of steps) {
      step.x = -step.x;
      step.rotationY = -step.rotationY;
    }
  }

  const totalRun = tread * (totalSteps - 1);
  const inclination = calculateInclination(input.floorHeight, totalRun);

  const validation = validateSnip(rise, tread, inclination, totalSteps);
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