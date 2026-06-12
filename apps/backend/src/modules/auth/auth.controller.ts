import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { RegisterInputSchema, LoginInputSchema } from "./auth.schema";

export class AuthController {
  private authService = new AuthService();

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = RegisterInputSchema.parse(req.body);
      const user = await this.authService.register(validated);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = LoginInputSchema.parse(req.body);
      const { user, token } = await this.authService.login(validated);

      // Set cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: false, // Set to false so it works on local development HTTP
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
        secure: false,
        sameSite: "lax",
      });
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  };
}
