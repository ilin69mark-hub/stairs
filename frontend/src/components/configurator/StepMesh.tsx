"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { Step } from "@stairs/geometry";

interface StepMeshProps {
  data: Step;
  stepWidth: number;
  material: string;
  isHovered?: boolean;
}

const materialColors: Record<string, string> = {
  oak: "#D2691E",
  beech: "#CD853F",
  ash: "#DEB887",
  pine: "#F4A460",
  metal: "#708090",
  glass: "#ADD8E6",
};

function buildWinderGeometry(innerArc: number, outerArc: number, thickness: number, angle: number, count: number, totalAngle: number = Math.PI / 2): THREE.BufferGeometry {
  const ht = thickness * 0.5;
  const stepAngle = totalAngle / count;
  const innerR = innerArc / stepAngle;
  const outerR = outerArc / stepAngle;
  const midR = (innerR + outerR) / 2;
  const delta = count > 1 ? stepAngle / 2 : 0;
  const a1 = angle - delta;
  const a2 = angle + delta;

  const cx = midR * Math.sin(angle);
  const cz = midR * (1 - Math.cos(angle));

  const toLocal = (r: number, a: number): [number, number] => {
    const wx = r * Math.sin(a);
    const wz = midR - r * Math.cos(a);
    const dx = wx - cx;
    const dz = wz - cz;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const lx = cosA * dx + sinA * dz;
    const lz = -sinA * dx + cosA * dz;
    return [-lx, -lz];
  };

  const p1 = toLocal(innerR, a1);
  const p2 = toLocal(outerR, a1);
  const p3 = toLocal(outerR, a2);
  const p4 = toLocal(innerR, a2);

  const vertices = new Float32Array([
    p1[0], ht, p1[1], p2[0], ht, p2[1], p3[0], ht, p3[1], p4[0], ht, p4[1],
    p1[0], -ht, p1[1], p2[0], -ht, p2[1], p3[0], -ht, p3[1], p4[0], -ht, p4[1],
  ]);

  const indices = [0,1,2, 0,2,3, 4,6,5, 4,7,6, 0,5,1, 0,4,5, 3,2,6, 3,6,7, 0,3,7, 0,7,4, 1,6,2, 1,5,6];

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export function StepMesh({ data, stepWidth, material, isHovered }: StepMeshProps) {
  const { x, y, z, rotationY, treadDepth, winderInnerDist, winderOuterDist } = data;

  const width = stepWidth * 0.001;
  const stepThickness = 40 * 0.001;
  const depth = treadDepth * 0.001;

  const geometry = useMemo(() => {
    if (winderInnerDist !== undefined && winderOuterDist !== undefined) {
      const count = data.winderCount ?? 5;
      const totalAngle = data.winderTotalAngle ?? Math.PI / 2;
      return buildWinderGeometry(winderInnerDist * 0.001, winderOuterDist * 0.001, stepThickness, rotationY, count, totalAngle);
    }
    return new THREE.BoxGeometry(width, stepThickness, depth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, stepThickness, depth, rotationY, winderInnerDist, winderOuterDist]);

  const pos: [number, number, number] = useMemo(() => {
    const stepY = y * 0.001 + stepThickness / 2;
    return [x * 0.001, stepY, z * 0.001];
  }, [x, y, z, stepThickness]);

  const segmentColor = data.segment === 1 ? "#8B4513" : data.segment === 2 ? "#CD853F" : null;
  const color = segmentColor || (materialColors[material] || materialColors.oak);

  return (
    <mesh geometry={geometry} position={pos} rotation-y={rotationY} castShadow receiveShadow>
      <meshStandardMaterial
        color={color}
        roughness={isHovered ? 0.3 : 0.7}
        metalness={0.1}
        emissive={isHovered ? color : "#000000"}
        emissiveIntensity={isHovered ? 0.3 : 0}
      />
    </mesh>
  );
}