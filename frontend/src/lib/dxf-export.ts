import Drawing from "dxf-writer";
import type { StairGeometry } from "@stairs/geometry";
import { getStepCorners, getBoundingBox, generateDimensions } from "./blueprint-utils";

export function exportToDXF(
  geometry: StairGeometry,
): string {
  const d = new Drawing();
  d.setUnits("Millimeters");

  d.addLayer("STEPS", Drawing.ACI.CYAN, "CONTINUOUS");
  d.addLayer("DIMENSIONS", Drawing.ACI.RED, "CONTINUOUS");
  d.addLayer("LABELS", Drawing.ACI.MAGENTA, "CONTINUOUS");

  const steps = geometry.steps;

  for (const step of steps) {
    const c = getStepCorners(step);
    const pts = [
      [c.x1, c.z1],
      [c.x2, c.z2],
      [c.x3, c.z3],
      [c.x4, c.z4],
    ] as [number, number][];

    d.setActiveLayer("STEPS");
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4;
      d.drawLine(pts[i][0], pts[i][1], pts[j][0], pts[j][1]);
    }

    d.setActiveLayer("LABELS");
    d.drawText(step.x, step.z, 40, 0, `${step.index + 1}`, "center", "middle");
  }

  d.setActiveLayer("DIMENSIONS");
  const dimLines = generateDimensions(steps, 1);
  for (const dl of dimLines) {
    d.drawLine(dl.startX, dl.startY, dl.endX, dl.endY);
    const midX = (dl.startX + dl.endX) / 2;
    const midY = (dl.startY + dl.endY) / 2;
    d.drawText(midX, midY, 30, 0, dl.label, "center", "middle");
  }

  const bb = getBoundingBox(steps);
  d.setActiveLayer("DIMENSIONS");
  d.drawRect(bb.minX, bb.minZ, bb.maxX, bb.maxZ);

  return d.toDxfString();
}
