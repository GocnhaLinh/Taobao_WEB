import axios from "axios";

const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Tự động thêm https:// nếu thiếu protocol
const API_URL = rawUrl.match(/^https?:\/\//) ? rawUrl : `https://${rawUrl}`;

console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);
console.log("Resolved API_URL =", API_URL);

export const axiosClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.message ||
      "An unexpected error occurred";
    return Promise.reject(new Error(message));
  },
);
