import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";

const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Tự động thêm https:// nếu thiếu protocol
const API_URL = rawUrl.match(/^https?:\/\//) ? rawUrl : `https://${rawUrl}`;

console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);
console.log("Resolved API_URL =", API_URL);

const instance: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Response interceptor trả về `response.data` thay vì `response`
instance.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";
    return Promise.reject(new Error(message));
  },
);

/**
 * Typed API client — wrapper loại bỏ nhu cầu dùng `<any, any>`
 * 
 * Các method .get<T> tự động trả về kiểu T nhờ interceptor
 */
export const api = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    instance.get(url, config) as Promise<T>,

  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    instance.post(url, data, config) as Promise<T>,

  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    instance.put(url, data, config) as Promise<T>,

  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    instance.patch(url, data, config) as Promise<T>,

  delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    instance.delete(url, config) as Promise<T>,
};

// Export axiosClient gốc để tương thích ngược
export const axiosClient = instance;
