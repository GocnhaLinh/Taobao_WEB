import { axiosClient } from '../../../../services/axiosClient';
import type { DashboardStats } from '../types';

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  return axiosClient.get<unknown, DashboardStats>('/dashboard/stats');
};
