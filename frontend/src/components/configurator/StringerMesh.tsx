"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { Step } from "@stairs/geometry";

interface StringerMeshProps {
  steps: Step[];
  stepWidth: number;
  side: "left" | "right";
}

export function StringerMesh({ steps, stepWidth, side }: StringerMeshProps) {
  const geometry = useMemo(() => {
    if (steps.length === 0) return null;

    const sideMultiplier = side === "left" ? -0.5 : 0.5;
    const points: THREE.Vector3[] = [];

    for (const step of steps) {
      const x = step.x * 0.001 + stepWidth * 0.001 * sideMultiplier;
      const y = step.y * 0.001;
      const z = step.z * 0.001;
      points.push(new THREE.Vector3(x, y, z));
    }

    if (points.length < 2) return null;

    points.unshift(new THREE.Vector3(points[0].x, 0, points[0].z));

    const lastStep = steps[steps.length - 1];
    points.push(new THREE.Vector3(
      points[points.length - 1].x,
      lastStep.y * 0.001 + lastStep.riseHeight * 0.001,
      points[points.length - 1].z
    ));

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeometry = new THREE.TubeGeometry(curve, points.length * 4, 0.04, 8, false);

    return tubeGeometry;
  }, [steps, stepWidth, side]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#5a3d2b" roughness={0.8} metalness={0.1} />
    </mesh>
  );
}