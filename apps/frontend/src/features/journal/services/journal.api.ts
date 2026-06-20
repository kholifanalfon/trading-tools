import { api } from "@/shared/config/api";
import {
  TradingJournal,
  CreateJournalPayload,
  UpdateJournalPayload,
} from "../types/journal.types";

export async function getJournalsApi(): Promise<TradingJournal[]> {
  const response = await api.get<TradingJournal[]>("/trading-journals");
  return response.data;
}

export async function getJournalByIdApi(id: number): Promise<TradingJournal> {
  const response = await api.get<TradingJournal>(`/trading-journals/${id}`);
  return response.data;
}

export async function createJournalApi(data: CreateJournalPayload): Promise<TradingJournal> {
  const response = await api.post<TradingJournal>("/trading-journals", data);
  return response.data;
}

export async function updateJournalApi(id: number, data: UpdateJournalPayload): Promise<TradingJournal> {
  const response = await api.put<TradingJournal>(`/trading-journals/${id}`, data);
  return response.data;
}

export async function deleteJournalApi(id: number): Promise<TradingJournal> {
  const response = await api.delete<TradingJournal>(`/trading-journals/${id}`);
  return response.data;
}
