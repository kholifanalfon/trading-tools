import { TechStackInfo } from "../types/info.types";

const API_URL = import.meta.env.FE_VITE_API_URL || "http://localhost:3000";

export async function fetchTechStackInfo(): Promise<TechStackInfo> {
  const response = await fetch(`${API_URL}/info`);
  if (!response.ok) {
    throw new Error("Failed to fetch backend tech stack info");
  }
  return response.json();
}
