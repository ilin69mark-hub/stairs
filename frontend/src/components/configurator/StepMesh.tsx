"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { Step } from "@stairs/geometry";

interface StepMeshProps {
  data: Step;
  stepWidth: number;
}

const materialColors: Record<string, string> = {
  oak: "#D2691E",
  beech: "#CD853F",
  ash: "#DEB887",
  pine: "#F4A460",
};

export function StepMesh({ data, stepWidth }: StepMeshProps) {
  const { x, y, z, isWinder, treadDepth } = data;

  const width = stepWidth;
  const stepThickness = 40;
  const depth = treadDepth;

  const geometry = useMemo(() => new THREE.BoxGeometry(width, stepThickness, depth), [width, stepThickness, depth]);

  const pos: [number, number, number] = useMemo(() => {
    const stepY = y + stepThickness / 2;
    return [x, stepY, z];
  }, [x, y, z, stepThickness]);

  const color = isWinder ? "#8B4513" : materialColors.oak;

  return (
    <mesh geometry={geometry} position={pos} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
    </mesh>
  );
}