import { Router } from "express";
import { LiveScreenerController } from "./live-screener.controller";
import { requireAuth } from "@/core/middlewares/auth.middleware";
import { validateQuery } from "@/core/middlewares/validation.middleware";
import { LiveStockDataQuerySchema } from "./live-screener.schema";

const router = Router();
const controller = new LiveScreenerController();

router.use(requireAuth);

router.get("/", validateQuery(LiveStockDataQuerySchema), controller.getLiveStockData);

export const liveScreenerRoutes = router;
