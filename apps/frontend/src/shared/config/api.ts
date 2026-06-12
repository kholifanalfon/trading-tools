import axios from "axios";

const API_URL = import.meta.env.FE_VITE_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
