/**
 * Global Axios interceptor — attaches the JWT Bearer token to every request.
 * Import this once at app entry (main.tsx) before any service is used.
 */
import axios from "axios";
import { getStoredToken } from "@/services/auth";

axios.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`;
  }
  return config;
});

export default axios;
