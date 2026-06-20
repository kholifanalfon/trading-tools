export interface TradingJournal {
  id: number;
  userId: number;
  portfolioId: number | null;
  transactionId: number | null;
  symbol: string;
  direction: "LONG" | "SHORT";
  entryDate: string;
  exitDate: string | null;
  entryPrice: string;
  exitPrice: string | null;
  quantity: string;
  status: "OPEN" | "CLOSED";
  pnl: string | null;
  setup: string | null;
  notes: string | null;
  emotions: string | null;
  rating: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJournalPayload {
  portfolioId?: number | null;
  symbol: string;
  direction: "LONG" | "SHORT";
  entryPrice: string;
  exitPrice?: string | null;
  quantity: string;
  status?: "OPEN" | "CLOSED";
  pnl?: string | null;
  setup?: string | null;
  notes?: string | null;
  emotions?: string | null;
  rating?: number | null;
  entryDate?: string | null;
  exitDate?: string | null;
}

export interface UpdateJournalPayload {
  portfolioId?: number | null;
  symbol?: string;
  direction?: "LONG" | "SHORT";
  entryPrice?: string;
  exitPrice?: string | null;
  quantity?: string;
  status?: "OPEN" | "CLOSED";
  pnl?: string | null;
  setup?: string | null;
  notes?: string | null;
  emotions?: string | null;
  rating?: number | null;
  entryDate?: string | null;
  exitDate?: string | null;
}
