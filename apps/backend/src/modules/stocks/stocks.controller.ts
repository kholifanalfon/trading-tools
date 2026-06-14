import { Request, Response, NextFunction } from "express";
import { StocksService } from "./stocks.service";
import { logger } from "@/core/logger";

export class StocksController {
  private service = new StocksService();

  getStocks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getStocks(req.query as any);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getStockById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid stock ID" });
        return;
      }
      const stock = await this.service.getStockById(id);
      res.status(200).json(stock);
    } catch (error) {
      next(error);
    }
  };

  createStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stock = await this.service.createStock(req.body);
      res.status(201).json(stock);
    } catch (error) {
      next(error);
    }
  };

  updateStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid stock ID" });
        return;
      }
      const stock = await this.service.updateStock(id, req.body);
      res.status(200).json(stock);
    } catch (error) {
      next(error);
    }
  };

  deleteStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid stock ID" });
        return;
      }
      await this.service.deleteStock(id);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  getSyncStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = this.service.getSyncState();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  syncStocks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const state = this.service.getSyncState();
      if (state.status === "running") {
        res.status(409).json({ error: "A stock synchronization process is already running." });
        return;
      }

      // Execute the sync in the background
      this.service.syncStocks().catch((error) => {
        logger.error(`Error in background stock sync: ${error instanceof Error ? error.message : String(error)}`);
      });

      res.status(202).json({
        success: true,
        message: "Stock synchronization started in the background.",
      });
    } catch (error) {
      next(error);
    }
  };
}
