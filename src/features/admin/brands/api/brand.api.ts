import { axiosClient } from '../../../../services/axiosClient';
import type { Brand } from '../types';

export const fetchBrands = async (): Promise<Brand[]> => {
  const res = await axiosClient.get<unknown, Brand[] | { brands: Brand[] }>('/brands', { params: { status: 'ACTIVE' } });
  return Array.isArray(res) ? res : res.brands || [];
};

export const fetchDeletedBrands = async (): Promise<Brand[]> => {
  const res = await axiosClient.get<unknown, Brand[] | { brands: Brand[] }>('/brands', { params: { status: 'DELETED' } });
  return Array.isArray(res) ? res : res.brands || [];
};

export const createBrandApi = async (data: {
  name: string;
  logo?: string;
  description?: string;
}): Promise<Brand> => {
  return axiosClient.post<unknown, Brand>('/brands', data);
};

export const updateBrandApi = async (data: {
  id: string;
  name?: string;
  logo?: string;
  description?: string;
  status?: string;
}): Promise<Brand> => {
  const payload: Record<string, unknown> = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.logo !== undefined) payload.logo = data.logo;
  if (data.description !== undefined) payload.description = data.description;
  if (data.status !== undefined) payload.status = data.status;

  return axiosClient.put<unknown, Brand>(`/brands/${data.id}`, payload);
};

export const deleteBrandApi = async (id: string): Promise<{ message: string }> => {
  return axiosClient.delete<unknown, { message: string }>(`/brands/${id}`);
};

export const restoreBrandApi = async (id: string): Promise<Brand> => {
  return axiosClient.put<unknown, Brand>(`/brands/${id}`, { status: 'ACTIVE' });
};

export const hardDeleteBrandApi = async (id: string): Promise<{ message: string }> => {
  return axiosClient.delete<unknown, { message: string }>(`/brands/${id}`, { params: { softDelete: false } });
};
