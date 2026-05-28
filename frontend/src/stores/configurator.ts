import { create } from "zustand";
import type { StairInput as StairInputBase } from "@stairs/geometry";

export type StairType = 'straight' | 'l-shaped' | 'u-shaped' | 'spiral';

export const STRINGER_MATERIALS = [
  { id: "oak", name: "Дуб", color: "#D2691E" },
  { id: "beech", name: "Бук", color: "#CD853F" },
  { id: "ash", name: "Ясень", color: "#DEB887" },
  { id: "pine", name: "Сосна", color: "#F4A460" },
  { id: "metal", name: "Металл", color: "#708090" },
] as const;

interface StairInput extends StairInputBase {
  material: string;
  railing: string;
  coating: string;
  stringerMaterial: string;
  stringerThickness: number;
  stepThickness: number;
  totalSteps?: number;
  lowerSteps?: number;
  overhang: number;
  direction: 'left' | 'right';
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
  setStringerMaterial: (material: string) => void;
  setStringerThickness: (thickness: number) => void;
  setStepThickness: (thickness: number) => void;
  setTotalSteps: (totalSteps?: number) => void;
  setLowerSteps: (lowerSteps?: number) => void;
  setOverhang: (overhang: number) => void;
  setDirection: (direction: 'left' | 'right') => void;
  reset: () => void;
}

const initialState: Omit<ConfiguratorState, 'setType' | 'setFloorHeight' | 'setOpeningWidth' | 'setOpeningLength' | 'setStepWidth' | 'setMaterial' | 'setRailing' | 'setCoating' | 'setStringerMaterial' | 'setStringerThickness' | 'setStepThickness' | 'setTotalSteps' | 'setLowerSteps' | 'setOverhang' | 'setDirection' | 'reset'> = {
  type: "straight",
  floorHeight: 2800,
  openingWidth: 900,
  openingLength: 3500,
  stepWidth: 900,
  material: "oak",
  railing: "wood",
  coating: "varnish",
  stringerMaterial: "oak",
  stringerThickness: 50,
  stepThickness: 40,
  overhang: 20,
  direction: 'left',
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
  setStringerMaterial: (stringerMaterial) => set({ stringerMaterial }),
  setStringerThickness: (stringerThickness) => set({ stringerThickness }),
  setStepThickness: (stepThickness) => set({ stepThickness }),
  setTotalSteps: (totalSteps) => set({ totalSteps }),
  setLowerSteps: (lowerSteps) => set({ lowerSteps }),
  setOverhang: (overhang) => set({ overhang }),
  setDirection: (direction) => set({ direction }),
  reset: () => set(initialState),
}));