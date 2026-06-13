import { Router } from "express";
import { AuthController } from "./auth.controller";
import { requireAuth } from "@/core/middlewares/auth.middleware";
import { authLimiter } from "@/core/middlewares/rate-limiter.middleware";

const router = Router();
const controller = new AuthController();

router.post("/register", authLimiter, controller.register);
router.post("/login", authLimiter, controller.login);
router.get("/me", requireAuth, controller.me);
router.post("/logout", requireAuth, controller.logout);

export const authRoutes = router;
