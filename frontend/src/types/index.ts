export type { StairInput, StairGeometry, Step } from '@stairs/geometry';

export type StairType = 'straight' | 'l-shaped' | 'u-shaped' | 'spiral';

export interface StairTypeInfo {
  id: string;
  slug: string;
  name: string;
  workPricePerStep: number;
  minHeight: number;
  maxHeight: number;
  imageUrl?: string;
  isActive: boolean;
}

export interface StairConfig {
  type: string;
  floorHeight: number;
  openingWidth: number;
  openingLength: number;
  stepWidth: number;
  material: string;
  railing?: string;
  coating?: string;
}

export interface StepPosition {
  index: number;
  position: [number, number, number];
  rotationY: number;
  isWinder: boolean;
  treadDepth: number;
  riseHeight: number;
  width: number;
}

export interface CalculationResult {
  steps: StepPosition[];
  totalSteps: number;
  totalRise: number;
  inclination: number;
  isValid: boolean;
  warnings: string[];
  materialCost: number;
  workCost: number;
  railingCost: number;
  coatingCost: number;
  totalPrice: number;
}

export interface Material {
  id: string;
  slug: string;
  name: string;
  type: string;
  pricePerUnit: number;
  unit: string;
  textureUrl?: string;
  normalMapUrl?: string;
  roughnessMapUrl?: string;
  isActive: boolean;
}

export interface Railing {
  id: string;
  slug: string;
  name: string;
  pricePerMeter: number;
  modelUrl?: string;
  isActive: boolean;
}

export interface Coating {
  id: string;
  slug: string;
  name: string;
  pricePerM2: number;
  isActive: boolean;
}

export interface CatalogResponse {
  stairTypes: StairTypeInfo[];
  materials: Material[];
  railings: Railing[];
  coatings: Coating[];
}

export interface OrderRequest {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  comment?: string;
  stairConfig: Record<string, unknown>;
}

export interface OrderResponse {
  orderId: string;
  orderNumber: string;
  status: string;
}

export interface ContactRequest {
  name: string;
  phone: string;
  email?: string;
  message?: string;
}

export interface ContactResponse {
  status: string;
  id: string;
}