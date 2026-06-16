import { Request, Response, NextFunction } from "express";
import { BacktestService } from "./backtest.service";

export class BacktestController {
  private service = new BacktestService();

  runBacktest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.runBacktest(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  runOptimization = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.runOptimization(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  runMultiStockOptimization = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.runMultiStockOptimization(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getReports = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getReports();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAiAlternative = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getAiAlternative(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
