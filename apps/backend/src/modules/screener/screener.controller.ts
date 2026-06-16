import { Request, Response, NextFunction } from "express";
import { ScreenerService } from "./screener.service";

export class ScreenerController {
  private service = new ScreenerService();

  searchStocks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const q = req.query.q as string;
      const result = await this.service.searchStocks(q);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getQuote = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const symbol = req.query.symbol as string;
      const result = await this.service.getQuote(symbol);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  startHistoricalSync = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.startHistoricalSync(req.body.date);
      res.status(202).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getHistoricalSyncStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = this.service.getHistoricalSyncState();
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getSyncLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getLatestLogs();
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getStockData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = req.query.search as string | undefined;
      const date = req.query.date as string | undefined;
      const watchlistVal = req.query.watchlist as any;
      const watchlist = watchlistVal === true || watchlistVal === "true" ? true : watchlistVal === false || watchlistVal === "false" ? false : undefined;
      const exchange = req.query.exchange as string | undefined;
      const strategy = req.query.strategy as string | undefined;

      const result = await this.service.getStockData({
        page,
        limit,
        search,
        date,
        watchlist,
        exchange,
        strategy,
      });
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getStockHistoricalData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const symbol = req.params.symbol as string;
      const limit = req.query.limit ? Number(req.query.limit) : 100;
      const timeframe = req.query.timeframe as string | undefined;
      const strategy = req.query.strategy as string | undefined;
      const result = await this.service.getStockHistoricalData(symbol, limit, timeframe, strategy);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
