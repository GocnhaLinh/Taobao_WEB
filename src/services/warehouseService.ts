import { axiosClient } from './axiosClient';
import type { Warehouse } from '../types';

export const fetchWarehouses = async (): Promise<Warehouse[]> => {
  return axiosClient.get<any, Warehouse[]>('/warehouses', { params: { status: 'ACTIVE' } });
};

export const fetchDeletedWarehouses = async (): Promise<Warehouse[]> => {
  return axiosClient.get<any, Warehouse[]>('/warehouses', { params: { status: 'DELETED' } });
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
  return axiosClient.post<any, Warehouse>('/warehouses', data);
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
  return axiosClient.put<any, Warehouse>(`/warehouses/${id}`, payload);
};

export const deleteWarehouseApi = async (id: string): Promise<any> => {
  return axiosClient.delete<any, any>(`/warehouses/${id}`);
};

export const restoreWarehouseApi = async (id: string): Promise<Warehouse> => {
  return axiosClient.put<any, Warehouse>(`/warehouses/${id}`, { status: 'ACTIVE' });
};

export const hardDeleteWarehouseApi = async (id: string): Promise<any> => {
  return axiosClient.delete<any, any>(`/warehouses/${id}`, { params: { softDelete: false } });
};

export const selectWarehouseByAddressApi = async (params: { province: string; district?: string; ward?: string }) => {
  return axiosClient.post<any, any>('/warehouses/select-by-address', params);
};
