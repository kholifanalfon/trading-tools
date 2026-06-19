import { Request, Response, NextFunction } from "express";
import { LiveScreenerService } from "./live-screener.service";

export class LiveScreenerController {
  private service = new LiveScreenerService();

  getLiveStockData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = req.query.search as string | undefined;
      const watchlistVal = req.query.watchlist as any;
      const watchlist = watchlistVal === true || watchlistVal === "true" ? true : watchlistVal === false || watchlistVal === "false" ? false : undefined;
      const exchange = req.query.exchange as string | undefined;
      const strategy = req.query.strategy as string | undefined;
      const refreshVal = req.query.refresh as any;
      const refresh = refreshVal === true || refreshVal === "true";

      const result = await this.service.getLiveStockData({
        page,
        limit,
        search,
        watchlist,
        exchange,
        strategy,
        refresh,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
