import { api } from "@/shared/config/api";
import {
  Portfolio,
  PortfolioDetail,
  CreatePortfolioPayload,
  UpdatePortfolioPayload,
  AddTransactionPayload,
  PortfolioTransaction,
  UserHoldingAsset,
} from "../types/portfolio.types";

export async function getPortfoliosApi(): Promise<Portfolio[]> {
  const response = await api.get<Portfolio[]>("/portfolios");
  return response.data;
}

export async function getPortfolioByIdApi(id: number): Promise<PortfolioDetail> {
  const response = await api.get<PortfolioDetail>(`/portfolios/${id}`);
  return response.data;
}

export async function createPortfolioApi(data: CreatePortfolioPayload): Promise<Portfolio> {
  const response = await api.post<Portfolio>("/portfolios", data);
  return response.data;
}

export async function updatePortfolioApi(id: number, data: UpdatePortfolioPayload): Promise<Portfolio> {
  const response = await api.put<Portfolio>(`/portfolios/${id}`, data);
  return response.data;
}

export async function deletePortfolioApi(id: number): Promise<Portfolio> {
  const response = await api.delete<Portfolio>(`/portfolios/${id}`);
  return response.data;
}

export async function addTransactionApi(portfolioId: number, data: AddTransactionPayload): Promise<PortfolioTransaction> {
  const response = await api.post<PortfolioTransaction>(`/portfolios/${portfolioId}/transactions`, data);
  return response.data;
}

export interface PortfoliosAssetSummary {
  assets: {
    id: number;
    portfolioId: number;
    portfolioName: string;
    symbol: string;
    quantity: string;
    averagePurchasePrice: string;
    takeProfit?: string | null;
    stopLoss?: string | null;
    createdAt: string;
    updatedAt: string;
  }[];
  transactions: {
    id: number;
    portfolioId: number;
    portfolioName: string;
    symbol: string;
    type: "BUY" | "SELL" | "DEPOSIT" | "WITHDRAW";
    quantity: string | null;
    price: string | null;
    fee: string;
    takeProfit?: string | null;
    stopLoss?: string | null;
    transactionDate: string;
    notes: string | null;
    createdAt: string;
  }[];
}

export async function getPortfoliosAssetSummaryApi(symbol: string): Promise<PortfoliosAssetSummary> {
  const response = await api.get<PortfoliosAssetSummary>(`/portfolios/assets/summary/${symbol}`);
  return response.data;
}

export async function getAllHoldingsApi(): Promise<UserHoldingAsset[]> {
  const response = await api.get<UserHoldingAsset[]>("/portfolios/assets/all");
  return response.data;
}
