import { axiosClient } from '../../../../services/axiosClient';
import type { Product, ProductVariant } from '../../../../types';
import type {
  BulkCreateVariantsData,
  BulkImageUpdateData,
} from '../types.ts';

export const fetchProductsApi = async (): Promise<Product[]> => {
  const res = await axiosClient.get<unknown, Product[] | { products: Product[] }>('/products');
  return Array.isArray(res) ? res : res.products || [];
};

export const fetchDeletedProductsApi = async (): Promise<Product[]> => {
  const res = await axiosClient.get<unknown, Product[] | { products: Product[] }>('/products', {
    params: { status: 'DELETED' },
  });
  return Array.isArray(res) ? res : res.products || [];
};

export const fetchProducts = fetchProductsApi;
export const fetchDeletedProducts = fetchDeletedProductsApi;

export const createProductApi = async (data: Partial<Product>): Promise<Product> => {
  return axiosClient.post<unknown, Product>('/products', data);
};

export const updateProductApi = async (
  data: { id: string } & Partial<Product>
): Promise<Product> => {
  const { id, ...rest } = data;
  return axiosClient.put<unknown, Product>(`/products/${id}`, rest);
};

export const deleteProductApi = async (
  id: string,
  softDelete = true
): Promise<{ message: string }> => {
  return axiosClient.delete<unknown, { message: string }>(`/products/${id}`, {
    params: { softDelete },
  });
};

export const createVariantApi = async (
  data: Partial<ProductVariant>
): Promise<ProductVariant> => {
  return axiosClient.post<unknown, ProductVariant>('/products/variants', data);
};

export const updateVariantApi = async (
  data: { id: string } & Partial<ProductVariant>
): Promise<ProductVariant> => {
  const { id, ...rest } = data;
  return axiosClient.put<unknown, ProductVariant>(`/products/variants/${id}`, rest);
};

export const deleteVariantApi = async (id: string): Promise<{ message: string }> => {
  return axiosClient.delete<unknown, { message: string }>(`/products/variants/${id}`);
};

export const updateVariantStatusApi = async (
  id: string,
  status: string
): Promise<ProductVariant> => {
  return axiosClient.patch<unknown, ProductVariant>(`/products/variants/${id}/status`, { status });
};

export const bulkCreateVariantsApi = async (
  data: BulkCreateVariantsData
): Promise<{ message: string; variants: ProductVariant[]; count: number }> => {
  return axiosClient.post<unknown, { message: string; variants: ProductVariant[]; count: number }>(
    '/products/variants/bulk',
    data
  );
};

export const bulkUpdateVariantImagesApi = async (
  data: BulkImageUpdateData
): Promise<{ message: string; count: number }> => {
  return axiosClient.patch<unknown, { message: string; count: number }>(
    '/products/variants/bulk-image',
    data
  );
};
