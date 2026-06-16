import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";

const isProduction = process.env.NODE_ENV === "production" || !!process.env.FLY_APP_NAME;

export class AuthController {
  private authService = new AuthService();

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.authService.register(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user, token } = await this.authService.login(req.body);

      // Set cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        signed: true,
      });

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // req.user is attached by auth middleware
      res.status(200).json((req as any).user);
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        signed: true,
      });
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  };
}
