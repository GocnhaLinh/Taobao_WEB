import { api } from '../../../../services/axiosClient';
import type { UserItem, CreateUserData, UpdateUserData } from '../types';

export const getUsersApi = async (): Promise<UserItem[]> => {
  const res = await api.get<UserItem[] | { users: UserItem[] }>('/users?status=ALL');
  return Array.isArray(res) ? res : res.users || [];
};

export const createUserApi = async (data: CreateUserData): Promise<UserItem> => {
  return api.post<UserItem>('/users/register', data);
};

export const updateUserApi = async (id: string, data: UpdateUserData): Promise<UserItem> => {
  return api.put<UserItem>(`/users/${id}`, data);
};

export const restoreUserApi = async (id: string): Promise<UserItem> => {
  return api.post<UserItem>(`/users/${id}/restore`);
};

export const deleteUserApi = async (id: string): Promise<{ message: string }> => {
  return api.delete<{ message: string }>(`/users/${id}`);
};
