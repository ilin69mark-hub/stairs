"use client";

import React, { useMemo } from "react";
import { useRef } from "react";
import * as THREE from "three";
import type { Step } from "@stairs/geometry";
import { StepMesh } from "./StepMesh";
import { StringerMesh } from "./StringerMesh";
import { RailingMesh } from "./RailingMesh";

interface StairSceneProps {
  geometry: Step[] | null;
  stepWidth: number;
  material: string;
  hoveredStepIndex?: number | null;
}

function getRiserMidPos(prevStep: Step, step: Step): [number, number, number] {
  const height = step.riseHeight * 0.001;
  const baseY = prevStep.y * 0.001 + height / 2;
  
  const midX = (prevStep.x + step.x) * 0.001 / 2;
  const midZ = (prevStep.z + step.z) * 0.001 / 2;
  
  if (prevStep.rotationY === 0) {
    return [midX, baseY, midZ];
  }
  
  if (prevStep.rotationY === Math.PI / 2) {
    return [midX, baseY, midZ];
  }
  
  if (prevStep.rotationY !== 0) {
    const cos = Math.cos(prevStep.rotationY);
    const sin = Math.sin(prevStep.rotationY);
    const localX = midX - prevStep.x * 0.001;
    const localZ = midZ - prevStep.z * 0.001;
    const rotatedX = localX * cos - localZ * sin;
    const rotatedZ = localX * sin + localZ * cos;
    return [prevStep.x * 0.001 + rotatedX, baseY, prevStep.z * 0.001 + rotatedZ];
  }
  return [midX, baseY, midZ];
}

function RiserMesh({ prevStep, step, stepWidth }: { prevStep: Step; step: Step; stepWidth: number }) {
  const { isWinder, riseHeight } = step;

  const height = riseHeight * 0.001;
  const thickness = 20 * 0.001;
  const stairWidth = stepWidth * 0.001;

  if (isWinder || height <= 0) return null;

  const pos = getRiserMidPos(prevStep, step);
  const isUpper = prevStep.rotationY === Math.PI / 2;
  
  const geometry = useMemo(() => {
    if (isUpper) return new THREE.BoxGeometry(thickness, height, stairWidth);
    return new THREE.BoxGeometry(stairWidth, height, thickness);
  }, [isUpper, height, stairWidth, thickness]);

  const shiftedPos: [number, number, number] = isUpper
    ? [pos[0] + thickness / 2, pos[1], pos[2]]
    : [pos[0], pos[1], pos[2] + thickness / 2];

  const rotY = isUpper ? 0 : Math.PI / 2;

  return (
    <mesh geometry={geometry} position={shiftedPos} rotation-y={rotY} castShadow>
      <meshStandardMaterial color="#ff0000" roughness={0.8} />
    </mesh>
  );
}

function Risers({ steps, stepWidth }: { steps: Step[]; stepWidth: number }) {
  const risers = useMemo(() => {
    return steps.map((step, index) => {
      if (index === 0) return null;
      const prevStep = steps[index - 1];
      if (prevStep.segment !== undefined && step.segment !== undefined && prevStep.segment !== step.segment) return null;
      return { prevStep, step, key: index };
    }).filter(Boolean);
  }, [steps]);

  return (
    <>
      {risers.map((riser) => {
        if (!riser) return null;
        const { prevStep, step, key } = riser;
        return (
          <React.Fragment key={key}>
<RiserMesh key={key} prevStep={prevStep} step={step} stepWidth={stepWidth} />
          </React.Fragment>
        );
      })}
    </>
  );
}

export function StairScene({ geometry, stepWidth, material, hoveredStepIndex }: StairSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  if (!geometry || geometry.length === 0) {
    return null;
  }

  const steps = geometry;
  const floorHeight = Math.max(...steps.map(s=>s.y));

  const segmentGroups = useMemo(() => {
    const groups: Record<number, Step[]> = {};
    for (const step of steps) {
      const seg = step.segment ?? 0;
      if (!groups[seg]) groups[seg] = [];
      groups[seg].push(step);
    }
    return Object.entries(groups)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([, segSteps]) => segSteps);
  }, [steps]);

  return (
    <group ref={groupRef}>
      {segmentGroups.map((segSteps) => (
        <group key={segSteps[0].segment ?? 0}>
          {segSteps.map((step) => (
            <StepMesh key={step.index} data={step} stepWidth={stepWidth} material={material} isHovered={hoveredStepIndex === step.index} />
          ))}
          {segSteps.length > 1 && (
            <>

            </>
          )}
        </group>
      ))}

      <Risers steps={steps} stepWidth={stepWidth} />

       {steps.length > 0 && (
         <>
           {/* Central pole for spiral */}
           {steps.some(s=>s.isWinder) && (
             <mesh position={[0, floorHeight * 0.001 / 2, 0]}>
               <cylinderGeometry args={[30 * 0.001, 30 * 0.001, floorHeight * 0.001, 16]} />
               <meshStandardMaterial color="#777777" />
             </mesh>
           )}
           <mesh position={[stepWidth * 0.001 / 2, -0.05, 2.5]}>
             <boxGeometry args={[5, 0.05, 5]} />
             <meshStandardMaterial color="#3a3a3a" transparent opacity={0.3} roughness={0.9} metalness={0.1} />
           </mesh>
         </>
       )}
      {/* Axis helper lines on the floor */}
      <group position={[stepWidth * 0.001 / 2 - 2.5, -0.05, 0]}>
        {/* X axis – red */}
        <line>
          <bufferGeometry>
            <bufferAttribute args={[new Float32Array([0,0,0, 0.5,0,0]), 3]} attach="attributes-position" />
          </bufferGeometry>
          <lineBasicMaterial color="red" />
        </line>
        {/* Y axis – green */}
        <line>
          <bufferGeometry>
            <bufferAttribute args={[new Float32Array([0,0,0, 0,0.5,0]), 3]} attach="attributes-position" />
          </bufferGeometry>
          <lineBasicMaterial color="green" />
        </line>
        {/* Z axis – blue */}
        <line>
          <bufferGeometry>
            <bufferAttribute args={[new Float32Array([0,0,0, 0,0,0.5]), 3]} attach="attributes-position" />
          </bufferGeometry>
          <lineBasicMaterial color="blue" />
        </line>
    {/* Labels */}
        {/* X */}
        <sprite position={[0.6, 0, 0]} scale={[0.12,0.12,0.12]}>
          <spriteMaterial
            attach="material"
            map={new THREE.CanvasTexture(
              (() => {
                const canvas = document.createElement('canvas');
                canvas.width = 64;
                canvas.height = 16;
                const ctx = canvas.getContext('2d')!;
                ctx.font = '12px sans-serif';
                ctx.fillStyle = 'red';
                ctx.fillText('X', 2, 12);
                return canvas;
              })()
            )}
          />
        </sprite>
        {/* Y */}
        <sprite position={[0, 0.6, 0]} scale={[0.12,0.12,0.12]}>
          <spriteMaterial
            attach="material"
            map={new THREE.CanvasTexture(
              (() => {
                const canvas = document.createElement('canvas');
                canvas.width = 64;
                canvas.height = 16;
                const ctx = canvas.getContext('2d')!;
                ctx.font = '12px sans-serif';
                ctx.fillStyle = 'green';
                ctx.fillText('Y', 2, 12);
                return canvas;
              })()
            )}
          />
        </sprite>
        {/* Z */}
        <sprite position={[0, 0, 0.6]} scale={[0.12,0.12,0.12]}>
          <spriteMaterial
            attach="material"
            map={new THREE.CanvasTexture(
              (() => {
                const canvas = document.createElement('canvas');
                canvas.width = 64;
                canvas.height = 16;
                const ctx = canvas.getContext('2d')!;
                ctx.font = '12px sans-serif';
                ctx.fillStyle = 'blue';
                ctx.fillText('Z', 2, 12);
                return canvas;
              })()
            )}
          />
        </sprite>
      </group>
    </group>
  );
}