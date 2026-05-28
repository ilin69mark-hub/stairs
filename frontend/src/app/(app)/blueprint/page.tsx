"use client";

import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStairConfigurator } from "@/hooks/useStairConfigurator";
import { calculateGeometry, type StairInput } from "@stairs/geometry";
import { BlueprintCanvas } from "@/components/blueprint/BlueprintCanvas";
import { ProjectionToggle } from "@/components/blueprint/ProjectionToggle";
import { ZoomControls } from "@/components/blueprint/ZoomControls";
import { Button } from "@/components/ui/button";
import type { Projection } from "@/types/blueprint";
import type Konva from "konva";

export default function BlueprintPage() {
  const router = useRouter();
  const { config } = useStairConfigurator();
  const stageRef = useRef<Konva.Stage>(null);

  const [projection, setProjection] = useState<Projection>("top");
  const [scale, setScale] = useState(0.5);

  const stairGeometry = useMemo(() => {
    return calculateGeometry({
      type: (config?.type || "l-shaped") as StairInput["type"],
      floorHeight: config?.floorHeight ?? 2800,
      openingWidth: config?.openingWidth ?? 900,
      openingLength: config?.openingLength ?? 3500,
      stepWidth: config?.stepWidth ?? 900,
    });
  }, [config]);

  useEffect(() => {
    if (typeof window !== "undefined" && stairGeometry.steps.length === 0) {
      router.replace("/configurator");
    }
  }, [stairGeometry, router]);

  if (stairGeometry.steps.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] text-gray-500">
        Загрузка...
      </div>
    );
  }

  const handleDownloadSVG = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const dataUrl = stage.toDataURL({ pixelRatio: 2, mimeType: "image/png" });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "chertezh-lestnitsy.png";
    a.click();
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between border-b bg-white px-6 py-3">
        <h1 className="text-lg font-semibold">Чертёж лестницы</h1>

        <div className="flex items-center gap-3">
          <ProjectionToggle value={projection} onChange={setProjection} />
          <ZoomControls scale={scale} onChange={setScale} />
          <Button variant="outline" size="sm" onClick={handleDownloadSVG}>
            Скачать PNG
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            Напечатать
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-gray-100">
        <BlueprintCanvas
          geometry={stairGeometry}
          scale={scale}
          projection={projection}
          showDimensions
          showLabels
          stageRef={stageRef}
          openingWidth={config?.openingWidth}
          openingLength={config?.openingLength}
          material={config?.material}
          overhang={config?.overhang}
        />
      </div>
    </div>
  );
}
