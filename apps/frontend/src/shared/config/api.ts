import axios from "axios";

const API_URL = window.__ENV__?.FE_VITE_API_URL || import.meta.env.FE_VITE_API_URL || "http://localhost:3000";

// Helper to get cookie value by name
function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

export class ApiError extends Error {
  public readonly type: "application" | "server";
  public readonly status: number;
  public readonly code: string;
  public readonly requestId?: string;
  public readonly details?: any;

  constructor(
    message: string,
    type: "application" | "server",
    status: number,
    code: string,
    requestId?: string,
    details?: any,
  ) {
    super(message);
    this.name = "ApiError";
    this.type = type;
    this.status = status;
    this.code = code;
    this.requestId = requestId;
    this.details = details;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.type === "server") {
      return `Internal Server Error. Please contact support. (Request ID: ${error.requestId || "N/A"})`;
    }
    // Form validation errors
    if (error.code === "VALIDATION_ERROR" && Array.isArray(error.details)) {
      return error.details.map((d: any) => `${d.message}`).join(", ");
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unknown error occurred";
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

// Response interceptor to map standardized backend error envelopes to ApiError
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const data = error.response.data;
      if (
        data &&
        typeof data === "object" &&
        "type" in data &&
        "status" in data
      ) {
        return Promise.reject(
          new ApiError(
            data.message || "An error occurred",
            data.type,
            data.status,
            data.code || "UNKNOWN_ERROR",
            data.requestId,
            data.details,
          ),
        );
      }
    }

    // Fallback for network issues or generic errors
    return Promise.reject(
      new ApiError(
        error.message || "Network Connection Error",
        "server",
        error.response?.status || 500,
        "NETWORK_ERROR",
      ),
    );
  },
);
