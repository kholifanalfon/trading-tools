import { Router } from "express";
import { SettingsController } from "./settings.controller";
import { requireAuth } from "@/core/middlewares/auth.middleware";
import { requireAdmin } from "@/core/middlewares/admin.middleware";
import { validateBody } from "@/core/middlewares/validation.middleware";
import { UpdateSettingsSchema } from "./settings.schema";

const router = Router();
const controller = new SettingsController();

router.use(requireAuth);
router.use(requireAdmin);

router.get("/", controller.getSettings);
router.put("/", validateBody(UpdateSettingsSchema), controller.updateSettings);

export const settingsRoutes = router;
