"use client";

import { Group, Rect, Text } from "react-konva";
import type { Step } from "@stairs/geometry";

interface StepSideViewProps {
  step: Step;
  scale: number;
  offsetX: number;
  offsetY: number;
}

export function StepSideView({ step, scale, offsetX, offsetY }: StepSideViewProps) {
  const w = step.treadDepth * scale;
  const h = step.riseHeight * scale;
  const cx = step.z * scale + offsetX;
  const cy = -(step.y - step.riseHeight / 2) * scale + offsetY;

  return (
    <Group>
      <Rect
        x={cx}
        y={cy}
        width={w}
        height={h}
        offsetX={w / 2}
        offsetY={h / 2}
        fill="#E0E0E0"
        stroke="#000000"
        strokeWidth={1}
      />
      <Text
        x={cx - 12}
        y={cy - 8}
        text={`${step.index + 1}`}
        fontSize={12}
        fill="#000000"
        width={24}
        align="center"
        fontFamily="monospace"
        listening={false}
      />
    </Group>
  );
}
