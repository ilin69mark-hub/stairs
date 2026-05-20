"use client";

import { useMemo } from "react";
import { useRef } from "react";
import * as THREE from "three";
import { Loader } from "@react-three/drei";
import type { Step } from "@stairs/geometry";
import { StepMesh } from "./StepMesh";
import { StringerMesh } from "./StringerMesh";
import { RailingMesh } from "./RailingMesh";

interface StairSceneProps {
  geometry: Step[] | null;
  stepWidth: number;
}

function RiserMesh({ step, stepWidth, riserY }: { step: Step; stepWidth: number; riserY: number }) {
  const { x, y, z, riseHeight, treadDepth, isWinder } = step;

  if (isWinder) return null;

  const height = riseHeight;
  const depth = 20;
  const width = stepWidth;

  const geometry = useMemo(() => new THREE.BoxGeometry(width, height, depth), [width, height, depth]);

  const pos: [number, number, number] = [
    x,
    riserY,
    z - treadDepth / 2,
  ];

  return (
    <mesh geometry={geometry} position={pos}>
      <meshStandardMaterial color="#ff0000" roughness={0.8} />
    </mesh>
  );
}

function Risers({ steps, stepWidth }: { steps: Step[]; stepWidth: number }) {
  const risers = useMemo(() => {
    return steps.map((step, index) => {
      if (index === 0) return null;
      const prevStep = steps[index - 1];
      const riserY = index === 1 ? 0 : prevStep.y - 20;
      return { step, riserY, key: index };
    }).filter(Boolean);
  }, [steps]);

  return (
    <>
      {risers.map((riser) => {
        if (!riser) return null;
        const { step, riserY, key } = riser;
        return <RiserMesh key={key} step={step} stepWidth={stepWidth} riserY={riserY} />;
      })}
    </>
  );
}

export function StairScene({ geometry, stepWidth }: StairSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  if (!geometry || geometry.length === 0) {
    return <Loader />;
  }

  const steps = geometry;

  return (
    <group ref={groupRef} scale={[0.001, 0.001, 0.001]}>
      {steps.map((step, index) => (
        <StepMesh key={index} data={step} stepWidth={stepWidth} />
      ))}

      <Risers steps={steps} stepWidth={stepWidth} />

      {steps.length > 0 && (
        <>
          <StringerMesh steps={steps} stepWidth={stepWidth} side="left" />
          <StringerMesh steps={steps} stepWidth={stepWidth} side="right" />
          <RailingMesh steps={steps} stepWidth={stepWidth} side="left" />
          <RailingMesh steps={steps} stepWidth={stepWidth} side="right" />
        </>
      )}

      {steps.length > 0 && (
        <mesh position={[stepWidth / 2, -50, 2500]}>
          <boxGeometry args={[5000, 50, 5000]} />
          <meshStandardMaterial color="#3a3a3a" transparent opacity={0.3} roughness={0.9} metalness={0.1} />
        </mesh>
      )}
    </group>
  );
}