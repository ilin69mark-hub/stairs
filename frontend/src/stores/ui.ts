import { create } from "zustand";
import type { Projection } from "@/types/blueprint";

export type ViewMode = "3d" | "2d";

interface UIState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  blueprintScale: number;
  setBlueprintScale: (scale: number) => void;
  blueprintProjection: Projection;
  setBlueprintProjection: (projection: Projection) => void;
  hoveredStepIndex: number | null;
  setHoveredStepIndex: (index: number) => void;
  clearHoveredStepIndex: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  viewMode: "3d",
  setViewMode: (viewMode) => set({ viewMode }),
  blueprintScale: 0.1,
  setBlueprintScale: (blueprintScale) => set({ blueprintScale }),
  blueprintProjection: "top",
  setBlueprintProjection: (blueprintProjection) => set({ blueprintProjection }),
  hoveredStepIndex: null,
  setHoveredStepIndex: (index) => set({ hoveredStepIndex: index }),
  clearHoveredStepIndex: () => set({ hoveredStepIndex: null }),
}));
