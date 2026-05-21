"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { Step } from "@stairs/geometry";

interface RailingMeshProps {
  steps: Step[];
  stepWidth: number;
  side: "left" | "right";
}

export function RailingMesh({ steps, stepWidth, side }: RailingMeshProps) {
  const balusters = useMemo(() => {
    if (steps.length === 0) return [];

    const result: { position: [number, number, number]; key: number }[] = [];
    const height = 0.9;
    const sideMultiplier = side === "left" ? -0.5 : 0.5;

    steps.forEach((step, index) => {
      const x = step.x * 0.001 + stepWidth * 0.001 * sideMultiplier;
      const y = step.y * 0.001 + step.riseHeight * 0.001 / 2;
      const z = step.z * 0.001;

      result.push({
        position: [x, y + height / 2, z],
        key: index,
      });
    });

    return result;
  }, [steps, stepWidth, side]);

  const handrailGeometry = useMemo(() => {
    if (steps.length === 0) return null;

    const sideMultiplier = side === "left" ? -0.5 : 0.5;
    const height = 0.9;
    const points: THREE.Vector3[] = [];

    steps.forEach((step) => {
      const x = step.x * 0.001 + stepWidth * 0.001 * sideMultiplier;
      const y = step.y * 0.001 + step.riseHeight * 0.001 + height;
      const z = step.z * 0.001;
      points.push(new THREE.Vector3(x, y, z));
    });

    if (points.length < 2) return null;

    points.unshift(new THREE.Vector3(points[0].x, points[0].y + 0.1, points[0].z));
    points.push(new THREE.Vector3(points[points.length - 1].x, points[points.length - 1].y, points[points.length - 1].z));

    try {
      const curve = new THREE.CatmullRomCurve3(points);
      return new THREE.TubeGeometry(curve, points.length * 4, 0.025, 8, false);
    } catch (e) {
      console.error("Error creating tube geometry:", e);
      return null;
    }
  }, [steps, stepWidth, side]);

  return (
    <group>
      {balusters.map((baluster) => (
        <mesh key={baluster.key} position={baluster.position}>
          <cylinderGeometry args={[0.015, 0.015, 0.9, 8]} />
          <meshStandardMaterial color="#333" roughness={0.4} metalness={0.6} />
        </mesh>
      ))}

      {handrailGeometry && (
        <mesh geometry={handrailGeometry}>
          <meshStandardMaterial color="#333" roughness={0.4} metalness={0.6} />
        </mesh>
      )}
    </group>
  );
}