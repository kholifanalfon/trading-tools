import { Request, Response, NextFunction } from "express";
import { SettingsService } from "./settings.service";

export class SettingsController {
  private service = new SettingsService();

  getSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getSettings();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.updateSettings(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  syncExchanges = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.syncExchanges();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getScoringRules = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getScoringRules();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateScoringRules = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.updateScoringRules(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getAiScreenerRecommendation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getAiScreenerRecommendation(req.body.strategy);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

