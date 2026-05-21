import { create } from "zustand";
import type { StairInput as StairInputBase, StairGeometry as StairGeometryBase, StairType } from "@stairs/geometry";

export type { StairType } from "@stairs/geometry";

export interface StairInput extends StairInputBase {
  material: string;
  railing: string;
  coating: string;
}

export interface CalculationResult extends StairGeometryBase {
  materialCost: number;
  workCost: number;
  railingCost: number;
  coatingCost: number;
  totalPrice: number;
}

interface CartState {
  currentConfig: StairInput | null;
  calculatedResult: CalculationResult | null;

  setConfig: (config: StairInput) => void;
  setResult: (result: CalculationResult) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  currentConfig: null,
  calculatedResult: null,

  setConfig: (config) => set({ currentConfig: config }),
  setResult: (result) => set({ calculatedResult: result }),
  clearCart: () => set({ currentConfig: null, calculatedResult: null }),
}));