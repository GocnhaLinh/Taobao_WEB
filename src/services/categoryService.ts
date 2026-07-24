import { axiosClient } from './axiosClient';
import type { Category } from '../types';

export const fetchCategories = async (): Promise<Category[]> => {
  return axiosClient.get<any, Category[]>('/categories');
};

export const fetchDeletedCategories = async (): Promise<Category[]> => {
  return axiosClient.get<any, Category[]>('/categories', { params: { status: 'DELETED' } });
};

export const createCategoryApi = async (data: { name: string; slug: string; sex?: string }): Promise<Category> => {
  return axiosClient.post<any, Category>('/categories', data);
};

export const updateCategoryApi = async (data: {
  id: string;
  name?: string;
  slug?: string;
  sex?: string;
  status?: string;
}): Promise<Category> => {
  return axiosClient.put<any, Category>(`/categories/${data.id}`, {
    name: data.name,
    slug: data.slug,
    sex: data.sex,
    status: data.status,
  });
};

export const deleteCategoryApi = async (id: string): Promise<any> => {
  return axiosClient.delete<any, any>(`/categories/${id}`);
};

export const restoreCategoryApi = async (id: string): Promise<Category> => {
  return axiosClient.put<any, Category>(`/categories/${id}`, { status: 'ACTIVE' });
};

export const hardDeleteCategoryApi = async (id: string): Promise<any> => {
  return axiosClient.delete<any, any>(`/categories/${id}`, { params: { softDelete: false } });
};
