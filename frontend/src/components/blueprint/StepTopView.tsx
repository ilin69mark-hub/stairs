"use client";

import { Group, Rect, Text } from "react-konva";
import type { Step } from "@stairs/geometry";

interface StepTopViewProps {
  step: Step;
  scale: number;
  offsetX: number;
  offsetY: number;
  isWinder: boolean;
}

export function StepTopView({ step, scale, offsetX, offsetY, isWinder }: StepTopViewProps) {
  const w = step.width * scale;
  const h = step.treadDepth * scale;
  const cx = step.x * scale + offsetX;
  const cy = -step.z * scale + offsetY;
  const deg = -step.rotationY * (180 / Math.PI);

  const fill = isWinder ? "#FFA500" : "#E0E0E0";

  return (
    <Group>
      <Rect
        x={cx}
        y={cy}
        width={w}
        height={h}
        offsetX={w / 2}
        offsetY={h / 2}
        rotation={deg}
        fill={fill}
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
