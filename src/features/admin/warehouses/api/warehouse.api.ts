import { axiosClient } from '../../../../services/axiosClient';
import type { Warehouse } from '../../../../types';

export const fetchWarehouses = async (): Promise<Warehouse[]> => {
  return axiosClient.get<unknown, Warehouse[]>('/warehouses', { params: { status: 'ACTIVE' } });
};

export const fetchDeletedWarehouses = async (): Promise<Warehouse[]> => {
  return axiosClient.get<unknown, Warehouse[]>('/warehouses', { params: { status: 'DELETED' } });
};

export const createWarehouseApi = async (data: {
  code: string;
  name: string;
  province: string;
  district?: string;
  address?: string;
  supportedProvinces?: string[];
  supportedDistricts?: string[];
  isDefault?: boolean;
}): Promise<Warehouse> => {
  return axiosClient.post<unknown, Warehouse>('/warehouses', data);
};

export const updateWarehouseApi = async (data: {
  id: string;
  code?: string;
  name?: string;
  province?: string;
  district?: string;
  address?: string;
  supportedProvinces?: string[];
  supportedDistricts?: string[];
  isDefault?: boolean;
  status?: string;
}): Promise<Warehouse> => {
  const { id, ...payload } = data;
  return axiosClient.put<unknown, Warehouse>(`/warehouses/${id}`, payload);
};

export const deleteWarehouseApi = async (id: string): Promise<{ message: string }> => {
  return axiosClient.delete<unknown, { message: string }>(`/warehouses/${id}`);
};

export const restoreWarehouseApi = async (id: string): Promise<Warehouse> => {
  return axiosClient.put<unknown, Warehouse>(`/warehouses/${id}`, { status: 'ACTIVE' });
};

export const hardDeleteWarehouseApi = async (id: string): Promise<{ message: string }> => {
  return axiosClient.delete<unknown, { message: string }>(`/warehouses/${id}`, { params: { softDelete: false } });
};

export const selectWarehouseByAddressApi = async (params: {
  province: string;
  district?: string;
  ward?: string;
}): Promise<Warehouse | null> => {
  return axiosClient.post<unknown, Warehouse | null>('/warehouses/select-by-address', params);
};
