import { Router } from "express";
import { BacktestController } from "./backtest.controller";
import { requireAuth } from "@/core/middlewares/auth.middleware";
import { validateBody } from "@/core/middlewares/validation.middleware";
import { z } from "zod";

const RunBacktestSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  strategy: z.enum(["day", "swing", "position"]),
  buyThreshold: z.number().min(0).max(100),
  sellThreshold: z.number().min(0).max(100),
  stopLossPercent: z.number(),
  takeProfitPercent: z.number(),
});

const RunMultiBacktestSchema = z.object({
  strategy: z.enum(["day", "swing", "position"]),
  buyThreshold: z.number().min(0).max(100),
  sellThreshold: z.number().min(0).max(100),
  stopLossPercent: z.number(),
  takeProfitPercent: z.number(),
});

const AiAlternativeSchema = z.object({
  strategy: z.enum(["day", "swing", "position"]),
  beforeParams: z.record(z.any()),
  beforeMetrics: z.record(z.any()),
  afterParams: z.record(z.any()),
  afterMetrics: z.record(z.any()),
});

const router = Router();
const controller = new BacktestController();

router.use(requireAuth);

router.post("/run", validateBody(RunBacktestSchema), controller.runBacktest);
router.post("/optimize", validateBody(RunBacktestSchema), controller.runOptimization);
router.post("/optimize-multi", validateBody(RunMultiBacktestSchema), controller.runMultiStockOptimization);
router.post("/ai-alternative", validateBody(AiAlternativeSchema), controller.getAiAlternative);
router.get("/reports", controller.getReports);

export const backtestRoutes = router;
