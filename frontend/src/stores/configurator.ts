import { create } from "zustand";
import type { StairInput as StairInputBase } from "@stairs/geometry";

export type StairType = 'straight' | 'l-shaped' | 'u-shaped' | 'spiral';

interface StairInput extends StairInputBase {
  material: string;
  railing: string;
  coating: string;
}

interface ConfiguratorState extends StairInput {
  setType: (type: StairType) => void;
  setFloorHeight: (floorHeight: number) => void;
  setOpeningWidth: (openingWidth: number) => void;
  setOpeningLength: (openingLength: number) => void;
  setStepWidth: (stepWidth: number) => void;
  setMaterial: (material: string) => void;
  setRailing: (railing: string) => void;
  setCoating: (coating: string) => void;
  reset: () => void;
}

const initialState: Omit<ConfiguratorState, 'setType' | 'setFloorHeight' | 'setOpeningWidth' | 'setOpeningLength' | 'setStepWidth' | 'setMaterial' | 'setRailing' | 'setCoating' | 'reset'> = {
  type: "straight",
  floorHeight: 2800,
  openingWidth: 900,
  openingLength: 3500,
  stepWidth: 900,
  material: "oak",
  railing: "wood",
  coating: "varnish",
};

export const useConfiguratorStore = create<ConfiguratorState>((set) => ({
  ...initialState,

  setType: (type) => set({ type }),
  setFloorHeight: (floorHeight) => set({ floorHeight }),
  setOpeningWidth: (openingWidth) => set({ openingWidth }),
  setOpeningLength: (openingLength) => set({ openingLength }),
  setStepWidth: (stepWidth) => set({ stepWidth }),
  setMaterial: (material) => set({ material }),
  setRailing: (railing) => set({ railing }),
  setCoating: (coating) => set({ coating }),
  reset: () => set(initialState),
}));