import { api } from "./axiosClient";

export * from "../types";
export * from "./userService";
export * from "./categoryService";
export * from "./brandService";
export * from "./productService";
export * from "./chatService";
export * from "./warehouseService";
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
