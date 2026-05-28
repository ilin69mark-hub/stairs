"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { Step } from "@stairs/geometry";

interface RailingMeshProps {
  steps: Step[];
  stepWidth: number;
  side: "left" | "right";
}

const RAILING_HEIGHT = 0.9;      // м — высота перил над ступенью
const BALUSTER_RADIUS = 0.015;   // м
const HANDRAIL_RADIUS = 0.025;   // м
const BALUSTER_SEGMENTS = 8;

/**
 * Для каждой ступени вычисляем позицию балясины/поручня.
 *
 * Ключевая идея:
 *   - step.x, step.z — ЦЕНТР ступени в метрах (после * 0.001)
 *   - step.rotationY — угол поворота ступени
 *   - Перило находится сбоку от ступени, т.е. смещено ПЕРПЕНДИКУЛЯРНО
 *     направлению движения (оси ступени).
 *
 * Направление движения ступени (вдоль её глубины):
 *   dir = (sin(rotationY), 0, cos(rotationY))
 *
 * Перпендикуляр (вправо от направления движения):
 *   perp = (cos(rotationY), 0, -sin(rotationY))
 *
 * Для left: смещаем на -halfWidth * perp
 * Для right: смещаем на +halfWidth * perp
 */
function getBalusterPosition(
  step: Step,
  halfWidth: number,
  sideSign: number,
): [number, number, number] {
  const cx = step.x * 0.001;
  const cy = step.y * 0.001; // верхняя грань ступени
  const cz = step.z * 0.001;

  // Перпендикуляр к направлению движения (вправо)
  const perpX =  Math.cos(step.rotationY);
  const perpZ = -Math.sin(step.rotationY);

  const bx = cx + sideSign * halfWidth * perpX;
  const bz = cz + sideSign * halfWidth * perpZ;
  const by = cy + RAILING_HEIGHT / 2;

  return [bx, by, bz];
}

function getHandrailPoint(
  step: Step,
  halfWidth: number,
  sideSign: number,
): THREE.Vector3 {
  const cx = step.x * 0.001;
  const cy = step.y * 0.001 + step.riseHeight * 0.001 + RAILING_HEIGHT;
  const cz = step.z * 0.001;

  const perpX =  Math.cos(step.rotationY);
  const perpZ = -Math.sin(step.rotationY);

  return new THREE.Vector3(
    cx + sideSign * halfWidth * perpX,
    cy,
    cz + sideSign * halfWidth * perpZ,
  );
}

export function RailingMesh({ steps, stepWidth, side }: RailingMeshProps) {
  const halfWidth = (stepWidth * 0.001) / 2;
  const sideSign = side === "right" ? 1 : -1;

  const balusters = useMemo(() => {
    return steps.map((step, index) => ({
      position: getBalusterPosition(step, halfWidth, sideSign),
      // Высота балясины = от верха ступени до поручня
      height: RAILING_HEIGHT,
      key: index,
    }));
  }, [steps, halfWidth, sideSign]);

  const handrailGeometry = useMemo(() => {
    if (steps.length < 2) return null;

    const points = steps.map((step) =>
      getHandrailPoint(step, halfWidth, sideSign),
    );

    // Добавляем небольшое продление в начале и конце для плавности
    const first = points[0];
    const second = points[1];
    const startDir = new THREE.Vector3().subVectors(first, second).normalize();
    points.unshift(first.clone().addScaledVector(startDir, -0.05));

    const last = points[points.length - 1];
    const prev = points[points.length - 2];
    const endDir = new THREE.Vector3().subVectors(last, prev).normalize();
    points.push(last.clone().addScaledVector(endDir, 0.05));

    try {
      const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
      const segments = Math.max(points.length * 6, 48);
      return new THREE.TubeGeometry(curve, segments, HANDRAIL_RADIUS, 8, false);
    } catch (e) {
      console.error("RailingMesh: ошибка создания TubeGeometry:", e);
      return null;
    }
  }, [steps, halfWidth, sideSign]);

  const railingMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#2a2a2a",
        roughness: 0.3,
        metalness: 0.7,
      }),
    [],
  );

  return (
    <group>
      {balusters.map(({ position, height, key }) => (
        <mesh key={key} position={position}>
          <cylinderGeometry
            args={[BALUSTER_RADIUS, BALUSTER_RADIUS, height, BALUSTER_SEGMENTS]}
          />
          <primitive object={railingMaterial} attach="material" />
        </mesh>
      ))}

      {handrailGeometry && (
        <mesh geometry={handrailGeometry}>
          <primitive object={railingMaterial} attach="material" />
        </mesh>
      )}
    </group>
  );
}