import { Request, Response, NextFunction } from "express";
import { UserManagementService } from "./user-management.service";

export class UserManagementController {
  private service = new UserManagementService();

  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getUsers(req.query as any);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid user ID" });
        return;
      }
      const user = await this.service.getUserById(id);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };

  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.service.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid user ID" });
        return;
      }
      const user = await this.service.updateUser(id, req.body);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid user ID" });
        return;
      }
      await this.service.deleteUser(id);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  };
}
