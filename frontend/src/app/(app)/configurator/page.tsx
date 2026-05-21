"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { useStairConfigurator } from "@/hooks/useStairConfigurator";
import { StairScene } from "@/components/configurator/StairScene";
import { Lighting } from "@/components/configurator/Lighting";
import { ControlPanel } from "@/components/configurator/ControlPanel";

export default function ConfiguratorPage() {
  const { config, geometry } = useStairConfigurator();

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <ControlPanel />

      <div className="flex-1 bg-gray-100">
        <Canvas shadows camera={{ position: [10, 10, 10], fov: 50 }}>
          <StairScene geometry={geometry} stepWidth={config?.stepWidth || 900} />
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.1}
          />
          <Environment preset="apartment" />
          <Lighting />
          <ContactShadows position={[0, -0.1, 0]} opacity={0.5} blur={2} />
        </Canvas>
      </div>
    </div>
  );
}