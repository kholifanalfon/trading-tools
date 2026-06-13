import axios from "axios";

const API_URL = import.meta.env.FE_VITE_API_URL || "http://localhost:3000";

// Helper to get cookie value by name
function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

export const api = axios.create({
  baseURL: `${API_URL.replace(/\/$/, "")}/api/v1`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to manually attach CSRF token for cross-origin requests
api.interceptors.request.use(
  (config) => {
    const xsrfToken = getCookie("XSRF-TOKEN");
    if (xsrfToken && config.headers) {
      config.headers["X-XSRF-TOKEN"] = xsrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
