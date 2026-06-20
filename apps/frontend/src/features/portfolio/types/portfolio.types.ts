export interface Portfolio {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  balance: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioAsset {
  id: number;
  portfolioId: number;
  symbol: string;
  quantity: string;
  averagePurchasePrice: string;
  takeProfit?: string | null;
  stopLoss?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioTransaction {
  id: number;
  portfolioId: number;
  symbol: string | null;
  type: "BUY" | "SELL" | "DEPOSIT" | "WITHDRAW";
  quantity: string | null;
  price: string | null;
  fee: string;
  takeProfit?: string | null;
  stopLoss?: string | null;
  transactionDate: string;
  notes: string | null;
  createdAt: string;
}

export interface PortfolioDetail extends Portfolio {
  assets: PortfolioAsset[];
  transactions: PortfolioTransaction[];
}

export interface CreatePortfolioPayload {
  name: string;
  description?: string;
  balance?: string;
}

export interface UpdatePortfolioPayload {
  name?: string;
  description?: string;
}

export interface AddTransactionPayload {
  symbol?: string | null;
  type: "BUY" | "SELL" | "DEPOSIT" | "WITHDRAW";
  quantity?: string | null;
  price?: string | null;
  fee?: string;
  takeProfit?: string | null;
  stopLoss?: string | null;
  transactionDate?: string | null;
  notes?: string | null;
}

export interface UserHoldingAsset extends PortfolioAsset {
  portfolioName: string;
}
