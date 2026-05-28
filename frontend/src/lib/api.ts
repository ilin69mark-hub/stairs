const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface StepPosition {
  index: number;
  position: [number, number, number];
  isWinder: boolean;
  treadDepth: number;
  riseHeight: number;
}

export interface CalculationResult {
  steps: StepPosition[];
  totalSteps: number;
  inclination: number;
  isValid: boolean;
  materialCost: number;
  workCost: number;
  railingCost: number;
  coatingCost: number;
  totalPrice: number;
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
  stringerMaterial?: string;
  stringerThickness?: number;
  stepThickness?: number;
  totalSteps?: number;
  lowerSteps?: number;
  overhang?: number;
  direction?: 'left' | 'right';
}

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

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
  signal?: AbortSignal
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    signal,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new ApiError(response.status, errorText);
  }

  return response.json();
}

export async function calculateStair(
  config: StairConfig,
  signal?: AbortSignal
): Promise<CalculationResult> {
  return fetchApi<CalculationResult>("/api/v1/calculate", {
    method: "POST",
    body: JSON.stringify(config),
  }, signal);
}

export async function getCatalog(): Promise<CatalogResponse> {
  return fetchApi<CatalogResponse>("/api/v1/catalog");
}

export async function createOrder(
  orderData: OrderRequest
): Promise<OrderResponse> {
  return fetchApi<OrderResponse>("/api/v1/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
}

export async function submitContact(
  contactData: ContactRequest
): Promise<ContactResponse> {
  return fetchApi<ContactResponse>("/api/v1/contacts", {
    method: "POST",
    body: JSON.stringify(contactData),
  });
}

export { ApiError };