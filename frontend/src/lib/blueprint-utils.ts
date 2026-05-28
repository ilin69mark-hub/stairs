import type { Step } from "@stairs/geometry";
import type { DimensionLine } from "../types/blueprint";

export function mmToPixel(mm: number, scale: number): number {
  return mm * scale;
}

export function getBoundingBox(steps: Step[]): {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  width: number;
  height: number;
} {
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  for (const step of steps) {
    const { x1, z1, x2, z2, x3, z3, x4, z4 } = getStepCorners(step);
    const xs = [x1, x2, x3, x4];
    const zs = [z1, z2, z3, z4];
    minX = Math.min(minX, ...xs);
    maxX = Math.max(maxX, ...xs);
    minZ = Math.min(minZ, ...zs);
    maxZ = Math.max(maxZ, ...zs);
  }

  return {
    minX,
    maxX,
    minZ,
    maxZ,
    width: maxX - minX,
    height: maxZ - minZ,
  };
}

export function getStepCorners(
  step: Step,
): { x1: number; z1: number; x2: number; z2: number; x3: number; z3: number; x4: number; z4: number } {
  if (step.isWinder && step.winderInnerDist !== undefined && step.winderOuterDist !== undefined && step.winderCount) {
    const totalAngle = step.winderTotalAngle || Math.PI / 2;
    const stepAngle = totalAngle / step.winderCount;
    const innerR = step.winderInnerDist / stepAngle;
    const outerR = step.winderOuterDist / stepAngle;
    const midR = (innerR + outerR) / 2;
    const delta = stepAngle / 2;
    const a1 = step.rotationY - delta;
    const a2 = step.rotationY + delta;
    const pivotX = step.x - midR * Math.sin(step.rotationY);
    const pivotZ = step.z - midR * Math.cos(step.rotationY);

    const polar = (r: number, a: number) => ({
      x: pivotX + r * Math.sin(a),
      z: pivotZ + r * Math.cos(a),
    });

    const p1 = polar(innerR, a1);
    const p2 = polar(outerR, a1);
    const p3 = polar(outerR, a2);
    const p4 = polar(innerR, a2);
    return { x1: p1.x, z1: p1.z, x2: p2.x, z2: p2.z, x3: p3.x, z3: p3.z, x4: p4.x, z4: p4.z };
  }

  const cos = Math.cos(step.rotationY);
  const sin = Math.sin(step.rotationY);
  const hw = step.width / 2;
  const hd = step.treadDepth / 2;

  const corners = [
    [-hw, -hd],
    [hw, -hd],
    [hw, hd],
    [-hw, hd],
  ] as const;

  const projected = corners.map(([lx, lz]) => ({
    x: step.x + cos * lx + sin * lz,
    z: step.z - sin * lx + cos * lz,
  }));

  return {
    x1: projected[0].x,
    z1: projected[0].z,
    x2: projected[1].x,
    z2: projected[1].z,
    x3: projected[2].x,
    z3: projected[2].z,
    x4: projected[3].x,
    z4: projected[3].z,
  };
}

function pointsEqual(a: number[], b: number[], tol = 0.5): boolean {
  return Math.hypot(a[0] - b[0], a[1] - b[1]) < tol;
}

function deduplicatePoints(pts: number[][]): number[][] {
  const out: number[][] = [];
  for (const p of pts) {
    if (!out.some((q) => pointsEqual(q, p))) out.push(p);
  }
  return out;
}

export function generateStringerOutline(steps: Step[]): { points: number[][]; closed: boolean } {
  const corners = steps.map((s) => {
    const c = getStepCorners(s);
    return [
      [c.x1, c.z1],
      [c.x2, c.z2],
      [c.x3, c.z3],
      [c.x4, c.z4],
    ] as number[][];
  });

  const allPts = corners.flat();
  const xs = allPts.map((p) => p[0]);
  const zs = allPts.map((p) => p[1]);

  if (!steps.some((s) => s.isWinder)) {
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs);
    return {
      points: [
        [minX, minZ],
        [maxX, minZ],
        [maxX, maxZ],
        [minX, maxZ],
      ],
      closed: true,
    };
  }

  // Collect left-edge points (p1, p4) and right-edge points (p2, p3) per step
  const leftPts: number[][] = [];
  const rightPts: number[][] = [];
  for (const s of steps) {
    const c = getStepCorners(s);
    leftPts.push([c.x1, c.z1], [c.x4, c.z4]);
    rightPts.push([c.x2, c.z2], [c.x3, c.z3]);
  }

  const ul = deduplicatePoints(leftPts);
  const ur = deduplicatePoints(rightPts);

  // Find turn center: average p1 of first and last winder steps
  const winderSteps = steps.filter((s) => s.isWinder);
  const ref = winderSteps[0];
  const refC = getStepCorners(ref);
  const cx = refC.x1;
  const cz = refC.z1;

  const angleFromCenter = (p: number[]) => Math.atan2(p[1] - cz, p[0] - cx);

  // Left side: sort by increasing angle (counterclockwise along the turn)
  ul.sort((a, b) => angleFromCenter(a) - angleFromCenter(b));
  // Right side: sort by decreasing angle
  ur.sort((a, b) => angleFromCenter(b) - angleFromCenter(a));

  const points = [...ul, ...ur];
  return { points, closed: true };
}

export function generateDimensions(steps: Step[], scale: number): DimensionLine[] {
  const lines: DimensionLine[] = [];
  const bb = getBoundingBox(steps);
  const offset = 40;

  const maxY = Math.max(...steps.map((s) => s.y));

  // Total width (X direction) — above the plan
  lines.push({
    startX: bb.minX,
    startY: bb.minZ - offset,
    endX: bb.maxX,
    endY: bb.minZ - offset,
    label: `${Math.round(bb.width)} мм`,
    offset,
    extX1: bb.minX, extY1: bb.minZ,
    extX2: bb.maxX, extY2: bb.minZ,
  });

  // Total depth (Z direction) — to the right of the plan
  lines.push({
    startX: bb.maxX + offset,
    startY: bb.minZ,
    endX: bb.maxX + offset,
    endY: bb.maxZ,
    label: `${Math.round(bb.height)} мм`,
    offset,
    extX1: bb.maxX, extY1: bb.minZ,
    extX2: bb.maxX, extY2: bb.maxZ,
  });

  // Step width from the first step (skip if same as total width)
  const first = steps[0];
  if (Math.round(first.width) !== Math.round(bb.width)) {
    lines.push({
      startX: first.x - first.width / 2,
      startY: bb.minZ - offset * 2,
      endX: first.x + first.width / 2,
      endY: bb.minZ - offset * 2,
      label: `${Math.round(first.width)} мм`,
      offset: offset * 2,
      extX1: first.x - first.width / 2, extY1: bb.minZ,
      extX2: first.x + first.width / 2, extY2: bb.minZ,
    });
  }

  // Total height — to the left of the plan
  lines.push({
    startX: bb.minX - offset,
    startY: 0,
    endX: bb.minX - offset,
    endY: maxY,
    label: `${Math.round(maxY)} мм`,
    offset,
    extX1: bb.minX, extY1: 0,
    extX2: bb.minX, extY2: maxY,
  });

  return lines;
}
