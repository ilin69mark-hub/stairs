"use client";

import { Group, Line, Text } from "react-konva";
import type { DimensionLine as DimensionLineType } from "@/types/blueprint";
import { mmToPixel } from "@/lib/blueprint-utils";

interface Props {
  dim: DimensionLineType;
  scale: number;
}

export function DimensionLine({ dim, scale }: Props) {
  const x1 = mmToPixel(dim.startX, scale);
  const y1 = mmToPixel(dim.startY, scale);
  const x2 = mmToPixel(dim.endX, scale);
  const y2 = mmToPixel(dim.endY, scale);

  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const tickLen = 6;

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  return (
    <Group>
      <Line points={[x1, y1, x2, y2]} stroke="#000000" strokeWidth={1} />
      <Line
        points={[x1 - nx * tickLen, y1 - ny * tickLen, x1 + nx * tickLen, y1 + ny * tickLen]}
        stroke="#000000"
        strokeWidth={1}
      />
      <Line
        points={[x2 - nx * tickLen, y2 - ny * tickLen, x2 + nx * tickLen, y2 + ny * tickLen]}
        stroke="#000000"
        strokeWidth={1}
      />
      <Text
        x={midX - 40}
        y={midY - 7}
        text={dim.label}
        fontSize={10}
        fill="#000000"
        width={80}
        align="center"
        fontFamily="monospace"
        listening={false}
      />
    </Group>
  );
}
