"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Stage, Layer, Rect, Line, Text, Arrow, Group } from "react-konva";
import type Konva from "konva";
import type { BlueprintProps, Projection } from "@/types/blueprint";
import {
  mmToPixel,
  getBoundingBox,
  getStepCorners,
  generateStringerOutline,
  generateDimensions,
} from "@/lib/blueprint-utils";
import { exportToDXF } from "@/lib/dxf-export";
import { useCartStore } from "@/stores/cart";

function project(
  x: number,
  y: number,
  z: number,
  proj: Projection,
  minX: number,
  minZ: number,
  maxZ: number,
  maxY: number,
): { x: number; y: number } {
  if (proj === "top") return { x, y: z };
  if (proj === "front") return { x, y };
  return { x: z, y };
}

export function BlueprintCanvas(props: BlueprintProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalRef = useRef<Konva.Stage>(null);
  const stageRef = props.stageRef ?? internalRef;
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { geometry, scale, projection, showDimensions, showLabels, hoveredStepIndex, onStepHover, openingWidth, openingLength, material, stringerMaterial, stringerThickness = 50, stepThickness = 40, overhang = 20 } = props;
  const steps = geometry.steps;
  const padding = 80;

  const bb = useMemo(() => getBoundingBox(steps), [steps]);
  const outline = useMemo(() => generateStringerOutline(steps), [steps]);
  const dimLines = useMemo(
    () => (showDimensions ? generateDimensions(steps, scale) : []),
    [steps, scale, showDimensions],
  );

  const maxY = useMemo(
    () => Math.max(...steps.map((s) => s.y), 1),
    [steps],
  );

  const toCanvas = useMemo(() => {
    const proj = projection;
    const isTop = proj === "top";
    const minProjX = isTop ? bb.minX : proj === "front" ? bb.minX : bb.minZ;
    const maxProjY = isTop ? bb.maxZ : maxY;

    const map = (x3d: number, z3d: number, y3d = 0) => {
      const p = project(x3d, y3d, z3d, proj, bb.minX, bb.minZ, bb.maxZ, maxY);
      return {
        x: padding + (p.x - minProjX) * scale,
        y: padding + (maxProjY - p.y) * scale,
      };
    };

    let minCx = Infinity, maxCx = -Infinity, minCy = Infinity, maxCy = -Infinity;
    for (const step of steps) {
      const corners = getStepCorners(step);
      for (const [x3d, z3d] of [[corners.x1, corners.z1], [corners.x2, corners.z2], [corners.x3, corners.z3], [corners.x4, corners.z4]]) {
        const c = map(x3d, z3d, step.y);
        if (c.x < minCx) minCx = c.x;
        if (c.x > maxCx) maxCx = c.x;
        if (c.y < minCy) minCy = c.y;
        if (c.y > maxCy) maxCy = c.y;
      }
    }

    const dw = maxCx - minCx;
    const dh = maxCy - minCy;
    const aw = Math.max(size.width - padding * 2, 1);
    const ah = Math.max(size.height - padding * 2, 1);
    const cx = (aw - dw) / 2 - minCx + padding;
    const cy = (ah - dh) / 2 - minCy + padding;

    return (x3d: number, z3d: number, y3d = 0) => {
      const raw = map(x3d, z3d, y3d);
      return { x: raw.x + cx, y: raw.y + cy };
    };
  }, [bb, maxY, scale, projection, steps, size]);

  const stairPoints = useMemo(() => {
    if (size.width === 0 || size.height === 0) return [];
    return steps.map((step) => {
      const c = getStepCorners(step);
      return [c.x1, c.z1, step.y, c.x2, c.z2, step.y, c.x3, c.z3, step.y, c.x4, c.z4, step.y];
    });
  }, [steps, size]);

  const outlineCanvas = useMemo(() => {
    if (size.width === 0 || size.height === 0) return [];
    return outline.points.map((p) => {
      const c = toCanvas(p[0], p[1]);
      return [c.x, c.y];
    });
  }, [outline, toCanvas, size]);

  const staircaseCenter = useMemo(() => {
    return {
      x: (bb.minX + bb.maxX) / 2,
      z: (bb.minZ + bb.maxZ) / 2,
    };
  }, [bb]);

  const openingCanvas = useMemo(() => {
    if (size.width === 0 || size.height === 0) return null;
    if (!openingWidth || !openingLength) return null;
    const hw = openingWidth / 2;
    const hl = openingLength / 2;
    const p1 = toCanvas(staircaseCenter.x - hw, staircaseCenter.z - hl);
    const p2 = toCanvas(staircaseCenter.x + hw, staircaseCenter.z + hl);
    return {
      x: Math.min(p1.x, p2.x),
      y: Math.min(p1.y, p2.y),
      width: Math.abs(p2.x - p1.x),
      height: Math.abs(p2.y - p1.y),
    };
  }, [openingWidth, openingLength, toCanvas, staircaseCenter, size]);

  const { calculatedResult } = useCartStore();
  const firstStep = steps[0];

  const tableRows = useMemo(() => {
    const rows: [string, string][] = [];
    rows.push(["Ступеней", `${geometry.totalSteps}`]);
    if (firstStep) {
      rows.push(["Подступенок", `${Math.round(firstStep.riseHeight)} мм`]);
      rows.push(["Проступь", `${Math.round(firstStep.treadDepth)} мм`]);
    }
    rows.push(["Уклон", `${Math.round(geometry.inclination)}°`]);
    rows.push(["Материал ступеней", material ?? "—"]);
    rows.push(["Толщина ступени", `${stepThickness} мм`]);
    rows.push(["Материал косоура", stringerMaterial ?? "—"]);
    if (calculatedResult?.totalPrice) {
      rows.push(["Цена", `${calculatedResult.totalPrice.toLocaleString("ru")} ₽`]);
    }
    return rows;
  }, [geometry, firstStep, material, calculatedResult]);

  const cellH = 14;
  const labelW = 90;
  const valueW = 100;
  const tableW = labelW + valueW + 16;
  const tableH = tableRows.length * cellH + 8;
  const tableX = Math.max(size.width - tableW - 12, 0);
  const tableY = Math.max(size.height - tableH - 12, 0);

  if (size.width === 0 || size.height === 0) {
    return (
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    );
  }

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <Stage ref={stageRef} width={size.width} height={size.height}>
        <Layer>
          <Rect
            x={0}
            y={0}
            width={size.width}
            height={size.height}
            fill="#ffffff"
            listening={false}
          />
          {openingCanvas && (
            <Rect
              x={openingCanvas.x}
              y={openingCanvas.y}
              width={openingCanvas.width}
              height={openingCanvas.height}
              stroke="#999999"
              strokeWidth={1.5}
              dash={[6, 4]}
              fill="transparent"
              listening={false}
            />
          )}
        </Layer>

        <Layer>
          {outlineCanvas.length > 0 && (
            <Line
              points={outlineCanvas.flat()}
              closed={outline.closed}
              stroke="#333333"
              strokeWidth={2}
              fill="#f0f0f0"
            />
          )}
        </Layer>

        {projection !== "top" && stringerThickness > 0 && steps.length > 0 && (
          <Layer>
            {projection === "front" && steps.map((s, i) => {
              const t = stringerThickness;
              const yTop = s.y - stepThickness;
              const yBot = Math.max(yTop - 295, 0);
              const lSeg = [
                toCanvas(bb.minX, 0, yBot),
                toCanvas(bb.minX, 0, yTop),
                toCanvas(bb.minX + t, 0, yTop),
                toCanvas(bb.minX + t, 0, yBot),
              ];
              const rSeg = [
                toCanvas(bb.maxX - t, 0, yBot),
                toCanvas(bb.maxX - t, 0, yTop),
                toCanvas(bb.maxX, 0, yTop),
                toCanvas(bb.maxX, 0, yBot),
              ];
              return (
                <Group key={i}>
                  <Line points={lSeg.flatMap(p => [p.x, p.y])} closed fill="#d4a574" listening={false} />
                  <Line points={rSeg.flatMap(p => [p.x, p.y])} closed fill="#d4a574" listening={false} />
                </Group>
              );
            })}
            {projection === "side" && (() => {
              const h = 295;
              const topPts: { z: number; y: number }[] = [];
              for (let i = 0; i < steps.length; i++) {
                const s = steps[i];
                const c = getStepCorners(s);
                const zMin = Math.min(c.z1, c.z2, c.z3, c.z4);
                const zMax = Math.max(c.z1, c.z2, c.z3, c.z4);
                const yTop = s.y - stepThickness;
                topPts.push({ z: zMin, y: yTop });
                topPts.push({ z: zMax, y: yTop });
                if (i < steps.length - 1) {
                  topPts.push({ z: zMax, y: steps[i + 1].y - stepThickness });
                }
              }
              const zFirst = topPts[0].z;
              const yFirst = topPts[0].y;
              const zLast = topPts[topPts.length - 1].z;
              const yLast = topPts[topPts.length - 1].y;
              const h2d: number[] = topPts.flatMap(p => {
                const c = toCanvas(0, p.z, p.y);
                return [c.x, c.y];
              });
              // Bottom edge parallel to line through far corners of 2nd and 2nd-to-last steps
              let bz: number, by: number, bdz: number, bdy: number;
              if (steps.length >= 4) {
                const r1 = getStepCorners(steps[1]);
                const r2 = getStepCorners(steps[steps.length - 2]);
                const zr1 = Math.max(r1.z1, r1.z2, r1.z3, r1.z4);
                const yr1 = steps[1].y - stepThickness;
                const zr2 = Math.max(r2.z1, r2.z2, r2.z3, r2.z4);
                const yr2 = steps[steps.length - 2].y - stepThickness;
                const dz = zr2 - zr1;
                const dy = yr2 - yr1;
                const len = Math.sqrt(dz * dz + dy * dy);
                bz = zr1 + h * dy / len;
                by = yr1 - h * dz / len;
                bdz = dz;
                bdy = dy;
              } else {
                bz = zFirst;
                by = yFirst - h;
                bdz = zLast - zFirst;
                bdy = yLast - yFirst;
              }
              const slopeB = bdy / bdz;
              const yAtFirst = by + slopeB * (zFirst - bz);
              const yAtLast = by + slopeB * (zLast - bz);
              const botEnd = toCanvas(0, zLast, yAtLast);
              const pts2d: number[] = [...h2d, botEnd.x, botEnd.y];
              if (yAtFirst < 0) {
                const zI = bz - by / slopeB;
                const floorMid = toCanvas(0, zI, 0);
                const floorFront = toCanvas(0, zFirst, 0);
                pts2d.push(floorMid.x, floorMid.y, floorFront.x, floorFront.y);
              } else {
                const botStart = toCanvas(0, zFirst, yAtFirst);
                pts2d.push(botStart.x, botStart.y);
              }
              return <Line points={pts2d} closed fill="#d4a574" stroke="#8b7355" strokeWidth={0.6} listening={false} />;
            })()}
          </Layer>
        )}

        <Layer>
          {projection === "top" && stairPoints.map((pt, i) => {
            const step = steps[i];
            const idx = step.index;
            const isHovered = hoveredStepIndex === idx;
            const p1 = toCanvas(pt[0], pt[1], pt[2]);
            const p2 = toCanvas(pt[3], pt[4], pt[5]);
            const p3 = toCanvas(pt[6], pt[7], pt[8]);
            const p4 = toCanvas(pt[9], pt[10], pt[11]);
            return (
              <Line
                key={idx}
                points={[p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y]}
                closed={true}
                stroke={isHovered ? "#222222" : "#666666"}
                strokeWidth={isHovered ? 3 : 1}
                fill={isHovered ? "#fff3e0" : "#ffffff"}
                onMouseEnter={() => onStepHover?.(idx)}
                onMouseLeave={() => onStepHover?.(null)}
                onTap={() => onStepHover?.(isHovered ? null : idx)}
              />
            );
          })}
          {projection !== "top" && steps.map((step) => {
            const idx = step.index;
            const isHovered = hoveredStepIndex === idx;
            const isFront = projection === "front";
            const nose = projection === "side" ? overhang : 0;
            const sn = Math.sin(step.rotationY) * nose;
            const cs = Math.cos(step.rotationY) * nose;
            const c = getStepCorners(step);
            const top = step.y;
            const bot = step.y - stepThickness;
            const x1n = c.x1 - sn;
            const x2n = c.x2 - sn;
            const z1n = c.z1 - cs;
            const z2n = c.z2 - cs;
            const xyMin = isFront ? Math.min(x1n, x2n, c.x3, c.x4) : Math.min(z1n, z2n, c.z3, c.z4);
            const xyMax = isFront ? Math.max(x1n, x2n, c.x3, c.x4) : Math.max(z1n, z2n, c.z3, c.z4);
            const bl = toCanvas(isFront ? xyMin : 0, isFront ? 0 : xyMin, bot);
            const br = toCanvas(isFront ? xyMax : 0, isFront ? 0 : xyMax, bot);
            const tr = toCanvas(isFront ? xyMax : 0, isFront ? 0 : xyMax, top);
            const tl = toCanvas(isFront ? xyMin : 0, isFront ? 0 : xyMin, top);
            return (
              <Line
                key={idx}
                points={[bl.x, bl.y, br.x, br.y, tr.x, tr.y, tl.x, tl.y]}
                closed={true}
                stroke={isHovered ? "#222222" : "#999999"}
                strokeWidth={isHovered ? 2 : 0.8}
                fill={isHovered ? "#fff3e0" : "transparent"}
                onMouseEnter={() => onStepHover?.(idx)}
                onMouseLeave={() => onStepHover?.(null)}
                onTap={() => onStepHover?.(isHovered ? null : idx)}
              />
            );
          })}
        </Layer>

        {showDimensions && (
          <Layer>
            {dimLines.map((dl, i) => {
              const s = toCanvas(dl.startX, dl.startY);
              const e = toCanvas(dl.endX, dl.endY);
              const ext1 = toCanvas(dl.extX1, dl.extY1);
              const ext2 = toCanvas(dl.extX2, dl.extY2);
              const dx = e.x - s.x;
              const dy = e.y - s.y;
              const isVertical = Math.abs(dy) > Math.abs(dx);
              const midX = (s.x + e.x) / 2;
              const midY = (s.y + e.y) / 2;
              return (
                <Group key={i}>
                  <Line
                    points={[ext1.x, ext1.y, s.x, s.y]}
                    stroke="#e53935"
                    strokeWidth={0.8}
                    listening={false}
                  />
                  <Line
                    points={[ext2.x, ext2.y, e.x, e.y]}
                    stroke="#e53935"
                    strokeWidth={0.8}
                    listening={false}
                  />
                  <Arrow
                    points={[s.x, s.y, e.x, e.y]}
                    stroke="#e53935"
                    strokeWidth={1.5}
                    fill="#e53935"
                    pointerLength={6}
                    pointerWidth={6}
                    pointerAtBeginning={true}
                    pointerAtEnding={true}
                    listening={false}
                  />
                  <Text
                    x={midX}
                    y={isVertical ? midY - 30 : midY + 6}
                    text={dl.label}
                    fontSize={10}
                    fill="#e53935"
                    fontFamily="monospace"
                    offsetX={30}
                    offsetY={isVertical ? 30 : 3}
                    rotation={isVertical ? (dy > 0 ? 90 : -90) : 0}
                    width={60}
                    align="center"
                    listening={false}
                  />
                </Group>
              );
            })}
          </Layer>
        )}

        {showLabels && (
          <Layer>
            {steps.map((step, i) => {
              const c = toCanvas(step.x, step.z, step.y);
              return (
                <Text
                  key={i}
                  x={c.x - 10}
                  y={c.y - 10}
                  text={`${i + 1}`}
                  fontSize={10}
                  fill="#999999"
                  fontFamily="monospace"
                  width={20}
                  align="center"
                />
              );
            })}
          </Layer>
        )}

        <Layer>
          <Group
            x={size.width - 240}
            y={8}
            onClick={() => {
              const stage = stageRef.current;
              if (!stage) return;
              const dataUrl = stage.toDataURL({ mimeType: "image/png", pixelRatio: 2 });
              const a = document.createElement("a");
              a.href = dataUrl;
              a.download = "blueprint.png";
              a.click();
            }}
          >
            <Rect
              x={0}
              y={0}
              width={112}
              height={26}
              fill="#e53935"
              cornerRadius={4}
              listening={true}
            />
            <Text
              x={0}
              y={0}
              width={112}
              height={26}
              text="Скачать PNG"
              fontSize={12}
              fill="#ffffff"
              fontFamily="monospace"
              align="center"
              verticalAlign="middle"
              listening={false}
            />
          </Group>

          <Group
            x={size.width - 120}
            y={8}
            onClick={() => {
              const dxf = exportToDXF(geometry);
              const blob = new Blob([dxf], { type: "application/dxf" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "blueprint.dxf";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Rect
              x={0}
              y={0}
              width={112}
              height={26}
              fill="#1e88e5"
              cornerRadius={4}
              listening={true}
            />
            <Text
              x={0}
              y={0}
              width={112}
              height={26}
              text="Скачать DXF"
              fontSize={12}
              fill="#ffffff"
              fontFamily="monospace"
              align="center"
              verticalAlign="middle"
              listening={false}
            />
          </Group>

          <Rect
            x={tableX}
            y={tableY}
            width={tableW}
            height={tableH}
            fill="#ffffff"
            stroke="#cccccc"
            strokeWidth={1}
            cornerRadius={4}
            listening={false}
          />
          {tableRows.map(([label, value], i) => (
            <Group key={i}>
              <Text
                x={tableX + 8}
                y={tableY + 4 + i * cellH}
                text={label}
                fontSize={8}
                fill="#333333"
                fontFamily="monospace"
                width={labelW}
              />
              <Text
                x={tableX + 8 + labelW}
                y={tableY + 4 + i * cellH}
                text={value}
                fontSize={8}
                fill="#000000"
                fontFamily="monospace"
                width={valueW}
                align="right"
              />
            </Group>
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
