"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useConfiguratorStore } from "@/stores/configurator";
import { useCartStore, CalculationResult as CartCalculationResult } from "@/stores/cart";
import { calculateStair } from "@/lib/api";
import { calculateGeometry } from "@stairs/geometry";
import type { Step, StairInput } from "@stairs/geometry";

export function useStairConfigurator() {
  const store = useConfiguratorStore();
  const { type, floorHeight, openingWidth, openingLength, stepWidth, material, railing, coating, stringerMaterial, stringerThickness, stepThickness, totalSteps, lowerSteps, overhang, direction, setType, setFloorHeight, setOpeningWidth, setOpeningLength, setStepWidth, setMaterial, setRailing, setCoating, setStringerMaterial, setStringerThickness, setStepThickness, setTotalSteps, setLowerSteps, setOverhang, setDirection } = store;

  const { calculatedResult, setResult } = useCartStore();
  const geometry = useMemo<Step[]>(() => {
    const input: StairInput = { type: type as StairInput['type'], floorHeight, openingWidth, openingLength, stepWidth, totalSteps, lowerSteps, overhang, direction };
    return calculateGeometry(input).steps;
  }, [type, floorHeight, openingWidth, openingLength, stepWidth, totalSteps, lowerSteps, overhang, direction]);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchPrice = useCallback(async (config: Parameters<typeof calculateStair>[0]) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoadingPrice(true);
    try {
      const result = await calculateStair(config, controller.signal);
      const cartResult: CartCalculationResult = {
        steps: result.steps.map(s => ({
          index: s.index, x: 0, y: s.position[1], z: s.position[2],
          rotationY: 0, isWinder: s.isWinder, treadDepth: s.treadDepth,
          riseHeight: s.riseHeight, width: 0,
        })),
        totalSteps: result.totalSteps,
        totalRise: result.steps.reduce((sum, s) => sum + s.riseHeight, 0),
        inclination: result.inclination,
        isValid: result.isValid,
        warnings: [],
        materialCost: result.materialCost,
        workCost: result.workCost,
        railingCost: result.railingCost,
        coatingCost: result.coatingCost,
        totalPrice: result.totalPrice,
      };
      setResult(cartResult);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error("Failed to calculate price:", error);
    } finally {
      setIsLoadingPrice(false);
    }
  }, [setResult]);

  useEffect(() => {
    fetchPrice({ type, floorHeight, openingWidth, openingLength, stepWidth, material, railing, coating, stringerMaterial, stringerThickness, stepThickness, totalSteps, lowerSteps, overhang, direction });
  }, [type, floorHeight, openingWidth, openingLength, stepWidth, material, railing, coating, stringerMaterial, stringerThickness, stepThickness, totalSteps, lowerSteps, overhang, direction, fetchPrice]);

  const config = { type, floorHeight, openingWidth, openingLength, stepWidth, material, railing, coating, stringerMaterial, stringerThickness, stepThickness, totalSteps, lowerSteps, overhang, direction };
  const updateConfig = { setType, setFloorHeight, setOpeningWidth, setOpeningLength, setStepWidth, setMaterial, setRailing, setCoating, setStringerMaterial, setStringerThickness, setStepThickness, setTotalSteps, setLowerSteps, setOverhang, setDirection };

  return { config, updateConfig, geometry, price: calculatedResult?.totalPrice, calculatedResult, isLoading: isLoadingPrice };
}