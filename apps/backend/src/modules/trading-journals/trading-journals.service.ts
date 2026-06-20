import { TradingJournalsRepository } from "./trading-journals.repository";
import { CreateTradingJournalInput, UpdateTradingJournalInput } from "./trading-journals.schema";

export class TradingJournalsService {
  private repository = new TradingJournalsRepository();

  async getJournals(userId: number) {
    return this.repository.getJournals(userId);
  }

  async getJournalById(id: number, userId: number) {
    const journal = await this.repository.getJournalById(id, userId);
    if (!journal) {
      throw new Error("Journal entry not found");
    }
    return journal;
  }

  async createJournal(userId: number, data: CreateTradingJournalInput) {
    let pnl = data.pnl;
    
    // Automatically calculate PnL if status is CLOSED and pnl is not provided
    if (data.status === "CLOSED" && !pnl && data.exitPrice) {
      const entryPrice = Number(data.entryPrice);
      const exitPrice = Number(data.exitPrice);
      const quantity = Number(data.quantity);
      
      if (data.direction === "LONG") {
        pnl = ((exitPrice - entryPrice) * quantity).toString();
      } else {
        pnl = ((entryPrice - exitPrice) * quantity).toString();
      }
    }

    return this.repository.createJournal(userId, {
      ...data,
      pnl,
    });
  }

  async updateJournal(id: number, userId: number, data: UpdateTradingJournalInput) {
    const existing = await this.repository.getJournalById(id, userId);
    if (!existing) {
      throw new Error("Journal entry not found");
    }

    let pnl = data.pnl;
    const nextStatus = data.status || existing.status;
    const direction = data.direction || existing.direction;
    const entryPrice = Number(data.entryPrice || existing.entryPrice);
    const exitPrice = data.exitPrice !== undefined ? (data.exitPrice ? Number(data.exitPrice) : null) : (existing.exitPrice ? Number(existing.exitPrice) : null);
    const quantity = Number(data.quantity || existing.quantity);

    // Recalculate PnL if status is transitioning to CLOSED or remains CLOSED and exitPrice/entryPrice/quantity changes
    if (nextStatus === "CLOSED" && !pnl && exitPrice !== null) {
      if (direction === "LONG") {
        pnl = ((exitPrice - entryPrice) * quantity).toString();
      } else {
        pnl = ((entryPrice - exitPrice) * quantity).toString();
      }
    }

    return this.repository.updateJournal(id, userId, {
      ...data,
      pnl,
    });
  }

  async deleteJournal(id: number, userId: number) {
    const existing = await this.repository.getJournalById(id, userId);
    if (!existing) {
      throw new Error("Journal entry not found");
    }
    return this.repository.deleteJournal(id, userId);
  }
}
