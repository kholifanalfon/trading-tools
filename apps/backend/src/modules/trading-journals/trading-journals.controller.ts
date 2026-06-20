import { Request, Response, NextFunction } from "express";
import { TradingJournalsService } from "./trading-journals.service";

export class TradingJournalsController {
  private service = new TradingJournalsService();

  getJournals = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const result = await this.service.getJournals(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getJournalById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const id = parseInt(req.params.id, 10);
      const result = await this.service.getJournalById(id, userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  createJournal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const result = await this.service.createJournal(userId, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateJournal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const id = parseInt(req.params.id, 10);
      const result = await this.service.updateJournal(id, userId, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteJournal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const id = parseInt(req.params.id, 10);
      const result = await this.service.deleteJournal(id, userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
