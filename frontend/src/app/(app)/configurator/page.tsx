"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { useStairConfigurator } from "@/hooks/useStairConfigurator";
import { useUIStore } from "@/stores/ui";
import { calculateGeometry, type StairInput } from "@stairs/geometry";
import { StairScene } from "@/components/configurator/StairScene";
import { Lighting } from "@/components/configurator/Lighting";
import { ControlPanel } from "@/components/configurator/ControlPanel";
import { ViewModeToggle } from "@/components/configurator/ViewModeToggle";
import { BlueprintCanvas } from "@/components/blueprint/BlueprintCanvas";
import { ProjectionToggle } from "@/components/blueprint/ProjectionToggle";
import { ZoomControls } from "@/components/blueprint/ZoomControls";

export default function ConfiguratorPage() {
  const { config, geometry } = useStairConfigurator();
  const { viewMode, setViewMode, blueprintScale, setBlueprintScale, blueprintProjection, setBlueprintProjection, hoveredStepIndex, setHoveredStepIndex, clearHoveredStepIndex } = useUIStore();

  const stairGeometry = useMemo(() => {
    return calculateGeometry({
      type: (config?.type || "l-shaped") as StairInput["type"],
      floorHeight: config?.floorHeight ?? 2800,
      openingWidth: config?.openingWidth ?? 900,
      openingLength: config?.openingLength ?? 3500,
      stepWidth: config?.stepWidth ?? 900,
    });
  }, [config]);

  const stairsCenter = useMemo((): [number, number, number] => {
    if (!geometry || geometry.length === 0) return [0, 1.4, 0];
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    for (const s of geometry) {
      if (s.x < minX) minX = s.x;
      if (s.x > maxX) maxX = s.x;
      if (s.y < minY) minY = s.y;
      if (s.y > maxY) maxY = s.y;
      if (s.z < minZ) minZ = s.z;
      if (s.z > maxZ) maxZ = s.z;
    }
    return [(minX + maxX) / 2 * 0.001, (minY + maxY) / 2 * 0.001, (minZ + maxZ) / 2 * 0.001];
  }, [geometry]);

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <ControlPanel />

      <div className="flex-1 flex flex-col bg-gray-100">
        <div className="flex items-center justify-end gap-3 px-4 py-2 border-b bg-white">
          <ViewModeToggle value={viewMode} onChange={setViewMode} />
        </div>

        <div className="flex-1">
          {viewMode === "3d" ? (
            <Canvas shadows camera={{ position: [stairsCenter[0] + 5, stairsCenter[1] + 3, stairsCenter[2] + 5], fov: 50 }} className="size-full">
              <StairScene geometry={geometry} stepWidth={config?.stepWidth || 900} material={config?.material || "oak"} hoveredStepIndex={hoveredStepIndex} />
              <OrbitControls
                makeDefault
                enableDamping
                dampingFactor={0.1}
                target={stairsCenter}
              />
              <Environment preset="apartment" />
              <Lighting />
              <ContactShadows position={[0, -0.1, 0]} opacity={0.5} blur={2} />
            </Canvas>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-end gap-3 px-4 py-1 border-b bg-white">
                <ProjectionToggle value={blueprintProjection} onChange={setBlueprintProjection} />
                <ZoomControls scale={blueprintScale} onChange={setBlueprintScale} />
              </div>
              <div className="flex-1 relative min-h-0">
                <BlueprintCanvas
                  geometry={stairGeometry}
                  scale={blueprintScale}
                  projection={blueprintProjection}
                  showDimensions
                  showLabels
                  hoveredStepIndex={hoveredStepIndex}
                  onStepHover={(idx) => idx !== null ? setHoveredStepIndex(idx) : clearHoveredStepIndex()}
                  openingWidth={config?.openingWidth}
                  openingLength={config?.openingLength}
                  material={config?.material}
                  stringerMaterial={config?.stringerMaterial}
                  stringerThickness={config?.stringerThickness}
                  stepThickness={config?.stepThickness}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
