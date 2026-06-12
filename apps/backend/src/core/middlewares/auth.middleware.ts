import { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose";
import { config } from "../config";
import { AuthRepository } from "../../modules/auth/auth.repository";

const secret = new TextEncoder().encode(config.BE_JWT_SECRET);
const authRepository = new AuthRepository();

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { payload } = await jwtVerify(token, secret);
    if (!payload || !payload.email) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await authRepository.getUserByEmail(payload.email as string);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const { userPassword: _, ...userWithoutPassword } = user;
    (req as any).user = userWithoutPassword;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
