"use client";

import { useMemo } from "react";
import { Group, Line, Ellipse } from "react-konva";
import type { Step } from "@stairs/geometry";
import { generateStringerOutline } from "@/lib/blueprint-utils";

interface Props {
  steps: Step[];
  scale: number;
  offsetX?: number;
  offsetY?: number;
}

export function StringerOutline({ steps, scale, offsetX = 0, offsetY = 0 }: Props) {
  const outline = useMemo(() => generateStringerOutline(steps), [steps]);

  const canvasPoints = useMemo(() => {
    return outline.points
      .map((p) => [p[0] * scale + offsetX, -p[1] * scale + offsetY])
      .flat();
  }, [outline, scale, offsetX, offsetY]);

  const isSpiral = useMemo(
    () => steps.every((s) => s.isWinder) && steps.some((s) => s.winderOuterDist !== undefined),
    [steps],
  );

  const spiralArcs = useMemo(() => {
    if (!isSpiral) return null;
    const innerR = Math.min(...steps.map((s) => s.winderInnerDist ?? 0));
    const outerR = Math.max(...steps.map((s) => s.winderOuterDist ?? 0));
    const cx = steps.reduce((a, s) => a + s.x, 0) / steps.length;
    const cz = steps.reduce((a, s) => a + s.z, 0) / steps.length;
    return {
      innerR: innerR * scale,
      outerR: outerR * scale,
      pillarR: 50 * scale,
      cx: cx * scale + offsetX,
      cy: -cz * scale + offsetY,
    };
  }, [isSpiral, steps, scale, offsetX, offsetY]);

  return (
    <Group>
      <Line
        points={canvasPoints}
        closed={outline.closed}
        stroke="#000000"
        strokeWidth={2}
      />
      {spiralArcs && (
        <>
          <Ellipse
            x={spiralArcs.cx}
            y={spiralArcs.cy}
            radiusX={spiralArcs.innerR}
            radiusY={spiralArcs.innerR}
            stroke="#000000"
            strokeWidth={1.5}
            fill="#ffffff"
          />
          <Ellipse
            x={spiralArcs.cx}
            y={spiralArcs.cy}
            radiusX={spiralArcs.outerR}
            radiusY={spiralArcs.outerR}
            stroke="#000000"
            strokeWidth={1.5}
            fill="transparent"
          />
          <Ellipse
            x={spiralArcs.cx}
            y={spiralArcs.cy}
            radiusX={spiralArcs.pillarR}
            radiusY={spiralArcs.pillarR}
            fill="#cccccc"
            stroke="#000000"
            strokeWidth={1}
          />
        </>
      )}
    </Group>
  );
}
