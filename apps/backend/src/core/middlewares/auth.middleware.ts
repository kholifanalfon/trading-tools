import { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose";
import { config } from "@/core/config";
import { AuthRepository } from "@/modules/auth/auth.repository";

const secret = new TextEncoder().encode(config.BE_JWT_SECRET);
const authRepository = new AuthRepository();

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    let token = req.signedCookies?.token;

    // Check Authorization header if cookie is not present
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (parts[0] === "Bearer" && parts[1]) {
        token = parts[1];
      }
    }

    if (typeof token !== "string" || !token.trim()) {
      throw new Error("Authentication required");
    }

    const { payload } = await jwtVerify(token, secret);
    if (!payload || typeof payload.email !== "string") {
      throw new Error("Invalid token");
    }

    const user = await authRepository.getUserByEmail(payload.email);
    if (!user) {
      throw new Error("User not found");
    }

    const { userPassword: _, ...userWithoutPassword } = user;
    (req as any).user = userWithoutPassword;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Authentication required or invalid session" });
  }
}
