import { api } from "./axiosClient";

export * from "../types";
export * from "../features/admin/categories/api/category.api";
export * from "../features/admin/brands/api/brand.api";
export * from "../features/admin/warehouses/api/warehouse.api";
export * from "../features/admin/orders/api/order.api";
export * from "../features/admin/users/api/user.api";
export * from "../features/admin/coupons/api/coupon.api";
export * from "../features/admin/reviews/api/review.api";
export * from "../features/admin/settings/api/settings.api";
export * from "../features/admin/products/api/product.api";
export * from "./chatService";
export * from "./uploadService";
export * from "./categoryLabelService";

export interface HealthResponse {
  status: string;
  db?: string;
  error?: string;
}

export const fetchHealth = async (): Promise<HealthResponse> => {
  return api.get<HealthResponse>("/health");
};
