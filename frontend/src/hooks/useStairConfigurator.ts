"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useConfiguratorStore } from "@/stores/configurator";
import { useCartStore, CalculationResult as CartCalculationResult } from "@/stores/cart";
import { calculateStair } from "@/lib/api";
import type { StairGeometry, Step, StairInput as StairInputBase } from '@/types';
import type { StairType } from "@/stores/configurator";

export function useStairConfigurator() {
  const {
    type,
    floorHeight,
    openingWidth,
    openingLength,
    stepWidth,
    material,
    railing,
    coating,
    setType,
    setFloorHeight,
    setOpeningWidth,
    setOpeningLength,
    setStepWidth,
    setMaterial,
    setRailing,
    setCoating,
  } = useConfiguratorStore();

  const { calculatedResult, setResult } = useCartStore();

  const [geometry, setGeometry] = useState<Step[]>([]);
  const isLoadingRef = useRef(false);
  const workerRef = useRef<Worker | null>(null);
  const workerDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const priceDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const fetchPrice = useCallback(async (config: Parameters<typeof calculateStair>[0]) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoading(true);
    try {
      const result = await calculateStair(config);
      const cartResult: CartCalculationResult = {
        steps: result.steps.map(s => ({
          index: s.index,
          x: 0,
          y: s.position[1],
          z: s.position[2],
          rotationY: 0,
          isWinder: s.isWinder,
          treadDepth: s.treadDepth,
          riseHeight: s.riseHeight,
          width: 0,
        })),
        totalSteps: result.totalSteps,
        totalRise: result.totalRise || result.steps.reduce((sum, s) => sum + s.riseHeight, 0),
        inclination: result.inclination,
        isValid: result.isValid,
        warnings: result.warnings || [],
        materialCost: result.materialCost,
        workCost: result.workCost,
        railingCost: result.railingCost,
        coatingCost: result.coatingCost,
        totalPrice: result.totalPrice,
      };
      setResult(cartResult);
    } catch (error) {
      console.error("Failed to calculate price:", error);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [setResult]);

  useEffect(() => {
    if (typeof window !== "undefined" && !workerRef.current) {
      workerRef.current = new Worker(
        new URL("../workers/geometry.worker.ts", import.meta.url)
      );

      workerRef.current.onmessage = (event: MessageEvent<{success: boolean, data?: StairGeometry, error?: string}>) => {
        if (event.data.success && event.data.data) {
          setGeometry(event.data.data.steps);
        }
      };
    }

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    if (workerDebounceRef.current) {
      clearTimeout(workerDebounceRef.current);
    }

    workerDebounceRef.current = setTimeout(() => {
      if (workerRef.current) {
        const input: StairInputBase = {
          type: type as StairInputBase['type'],
          floorHeight,
          openingWidth,
          openingLength,
          stepWidth,
        };
        workerRef.current.postMessage(input);
      }
    }, 100);

    return () => {
      if (workerDebounceRef.current) {
        clearTimeout(workerDebounceRef.current);
      }
    };
  }, [type, floorHeight, openingWidth, openingLength, stepWidth, material, railing, coating]);

  useEffect(() => {
    if (priceDebounceRef.current) {
      clearTimeout(priceDebounceRef.current);
    }

    priceDebounceRef.current = setTimeout(() => {
      fetchPrice({
        type,
        floorHeight,
        openingWidth,
        openingLength,
        stepWidth,
        material,
        railing,
        coating,
      });
    }, 300);

    return () => {
      if (priceDebounceRef.current) {
        clearTimeout(priceDebounceRef.current);
      }
    };
  }, [type, floorHeight, openingWidth, openingLength, stepWidth, material, railing, coating, fetchPrice]);

  const config = {
    type,
    floorHeight,
    openingWidth,
    openingLength,
    stepWidth,
    material,
    railing,
    coating,
  };

  const updateConfig = {
    setType,
    setFloorHeight,
    setOpeningWidth,
    setOpeningLength,
    setStepWidth,
    setMaterial,
    setRailing,
    setCoating,
  };

  return {
    config,
    updateConfig,
    geometry,
    price: calculatedResult?.totalPrice,
    calculatedResult,
    isLoading,
  };
}