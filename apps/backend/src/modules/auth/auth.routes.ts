import { Router } from "express";
import { AuthController } from "./auth.controller";
import { requireAuth } from "../../core/middlewares/auth.middleware";

const router = Router();
const controller = new AuthController();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/me", requireAuth, controller.me);
router.post("/logout", requireAuth, controller.logout);

export const authRoutes = router;
