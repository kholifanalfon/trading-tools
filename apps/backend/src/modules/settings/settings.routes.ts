import { Router } from "express";
import { SettingsController } from "./settings.controller";
import { requireAuth } from "@/core/middlewares/auth.middleware";
import { requireAdmin } from "@/core/middlewares/admin.middleware";
import { validateBody } from "@/core/middlewares/validation.middleware";
import { UpdateSettingsSchema, UpdateScoringRulesBatchSchema } from "./settings.schema";

import { z } from "zod";

const router = Router();
const controller = new SettingsController();

router.use(requireAuth);
router.use(requireAdmin);

router.get("/", controller.getSettings);
router.put("/", validateBody(UpdateSettingsSchema), controller.updateSettings);
router.post("/exchanges/sync", controller.syncExchanges);
router.get("/scoring-rules", controller.getScoringRules);
router.put("/scoring-rules", validateBody(UpdateScoringRulesBatchSchema), controller.updateScoringRules);
router.post("/ai-recommendation", validateBody(z.object({ strategy: z.enum(["day", "swing", "position"]) })), controller.getAiScreenerRecommendation);

export const settingsRoutes = router;
