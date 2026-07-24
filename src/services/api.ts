import { axiosClient } from "./axiosClient";

export * from "../types";
export * from "./userService";
export * from "./categoryService";
export * from "./brandService";
export * from "./productService";
export * from "./chatService";
export * from "./warehouseService";
export * from "./settingsService";
export * from "./categoryLabelService";

export const fetchHealth = async () => {
  return axiosClient.get<{ status: string }>("/health");
};
