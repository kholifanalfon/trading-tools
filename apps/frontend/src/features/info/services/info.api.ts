import { api } from "@/shared/config/api";
import { TechStackInfo } from "../types/info.types";

export async function fetchTechStackInfo(): Promise<TechStackInfo> {
  const response = await api.get<TechStackInfo>("/");
  return response.data;
}

export async function triggerBackendSentryTest(): Promise<void> {
  await api.get("/sentry-test");
}
