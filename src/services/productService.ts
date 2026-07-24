import { axiosClient } from './axiosClient';
import type { Product, ProductVariant } from '../types';

export const fetchProducts = async (): Promise<Product[]> => {
  const res = await axiosClient.get<any, any>('/products');
  return Array.isArray(res) ? res : res.products || [];
};

export const fetchDeletedProducts = async (): Promise<Product[]> => {
  const res = await axiosClient.get<any, any>('/products', { params: { status: 'DELETED' } });
  return Array.isArray(res) ? res : res.products || [];
};

export const createProductApi = async (data: Partial<Product>): Promise<Product> => {
  return axiosClient.post('/products', data);
};

export const updateProductApi = async (data: { id: string } & Partial<Product>): Promise<Product> => {
  const { id, ...rest } = data;
  return axiosClient.put(`/products/${id}`, rest);
};

export const deleteProductApi = async (id: string, softDelete = true): Promise<any> => {
  return axiosClient.delete(`/products/${id}`, { params: { softDelete } });
};

export const createVariantApi = async (data: Partial<ProductVariant>): Promise<ProductVariant> => {
  return axiosClient.post('/products/variants', data);
};

export const updateVariantApi = async (data: { id: string } & Partial<ProductVariant>): Promise<ProductVariant> => {
  const { id, ...rest } = data;
  return axiosClient.put(`/products/variants/${id}`, rest);
};

export const deleteVariantApi = async (id: string): Promise<any> => {
  return axiosClient.delete(`/products/variants/${id}`);
};
