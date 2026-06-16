import { Router } from "express";
import { AuthController } from "./auth.controller";
import { requireAuth } from "@/core/middlewares/auth.middleware";
import { authLimiter } from "@/core/middlewares/rate-limiter.middleware";
import { validateBody } from "@/core/middlewares/validation.middleware";
import { RegisterInputSchema, LoginInputSchema } from "./auth.schema";

const router = Router();
const controller = new AuthController();

router.post("/register", authLimiter, validateBody(RegisterInputSchema), controller.register);
router.post("/login", authLimiter, validateBody(LoginInputSchema), controller.login);
router.get("/me", requireAuth, controller.me);
router.post("/logout", requireAuth, controller.logout);

export const authRoutes = router;
