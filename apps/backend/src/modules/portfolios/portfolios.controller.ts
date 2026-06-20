import { Request, Response, NextFunction } from "express";
import { PortfoliosService } from "./portfolios.service";

export class PortfoliosController {
  private service = new PortfoliosService();

  getPortfolios = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const result = await this.service.getPortfolios(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getPortfolioById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const portfolioId = parseInt(req.params.id, 10);
      const result = await this.service.getPortfolioById(portfolioId, userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  createPortfolio = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const result = await this.service.createPortfolio(userId, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  updatePortfolio = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const portfolioId = parseInt(req.params.id, 10);
      const result = await this.service.updatePortfolio(portfolioId, userId, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  deletePortfolio = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const portfolioId = parseInt(req.params.id, 10);
      const result = await this.service.deletePortfolio(portfolioId, userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  addTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const portfolioId = parseInt(req.params.id, 10);
      const result = await this.service.addTransaction(portfolioId, userId, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  getPortfoliosAssetSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const symbol = req.params.symbol;
      const result = await this.service.getPortfoliosAssetSummary(userId, symbol);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAllAssets = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const result = await this.service.getAllAssets(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
