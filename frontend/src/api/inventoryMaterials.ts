import axios from "axios";

import { api } from "./client";

export type InventoryMaterialType = "FABRIC" | "RAW_MATERIAL";
export type InventoryMaterialStatus = "ACTIVE" | "INACTIVE" | "DISCONTINUED";

export interface InventoryMaterial {
  id: number;
  sourceMaterialSupplyId: number | null;
  materialCode: string;
  materialName: string;
  materialDescription: string | null;
  materialType: InventoryMaterialType;
  unitOfMeasure: string;
  currentQuantity: string;
  lowStockThreshold: string;
  status: InventoryMaterialStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInventoryMaterialInput {
  sourceMaterialSupplyId: string;
  materialCode: string;
  materialName: string;
  materialDescription: string;
  materialType: InventoryMaterialType;
  unitOfMeasure: string;
  currentQuantity: string;
  lowStockThreshold: string;
}

export interface CreateInventoryMaterialResponse {
  message: string;
  material: InventoryMaterial;
}

export interface InventoryMaterialListResponse {
  materials: InventoryMaterial[];
}

interface InventoryMaterialApiErrorBody {
  error?: {
    code?: string;
    message?: string;
    fields?: Record<string, string>;
  };
}

export interface InventoryMaterialApiError {
  code?: string;
  message: string;
  fields: Record<string, string>;
  status?: number;
}

export async function createInventoryMaterial(
  input: CreateInventoryMaterialInput,
): Promise<CreateInventoryMaterialResponse> {
  const sourceMaterialSupplyId = input.sourceMaterialSupplyId.trim();
  const response = await api.post<CreateInventoryMaterialResponse>(
    "/inventory-materials",
    {
      ...input,
      sourceMaterialSupplyId: sourceMaterialSupplyId ? Number(sourceMaterialSupplyId) : null,
    },
  );
  return response.data;
}

export async function getInventoryMaterials(
  signal?: AbortSignal,
): Promise<InventoryMaterial[]> {
  const response = await api.get<InventoryMaterialListResponse>("/inventory-materials", {
    signal,
  });
  return response.data.materials;
}

export function getInventoryMaterialApiError(
  error: unknown,
  fallback: string,
): InventoryMaterialApiError {
  if (!axios.isAxiosError<InventoryMaterialApiErrorBody>(error)) {
    return { message: error instanceof Error ? error.message : fallback, fields: {} };
  }

  return {
    code: error.response?.data.error?.code,
    message: error.response?.data.error?.message ?? fallback,
    fields: error.response?.data.error?.fields ?? {},
    status: error.response?.status,
  };
}
