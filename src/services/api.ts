import { api } from "./axiosClient";

export * from "../types";
export * from "./userService";
export * from "../features/admin/categories/api/category.api";
export * from "../features/admin/brands/api/brand.api";
export * from "../features/admin/warehouses/api/warehouse.api";
export * from "./productService";
export * from "./chatService";
export * from "./settingsService";
export * from "./categoryLabelService";

export interface HealthResponse {
  status: string;
  db?: string;
  error?: string;
}

export const fetchHealth = async (): Promise<HealthResponse> => {
  return api.get<HealthResponse>("/health");
};
