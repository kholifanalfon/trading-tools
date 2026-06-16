import { Router } from "express";
import { BacktestController } from "./backtest.controller";
import { requireAuth } from "@/core/middlewares/auth.middleware";
import { validateBody } from "@/core/middlewares/validation.middleware";
import { AiAlternativeSchema, RunBacktestSchema, RunMultiBacktestSchema } from "./backtest.schema";

const router = Router();
const controller = new BacktestController();

router.use(requireAuth);

router.post("/run", validateBody(RunBacktestSchema), controller.runBacktest);
router.post("/optimize", validateBody(RunBacktestSchema), controller.runOptimization);
router.post("/optimize-multi", validateBody(RunMultiBacktestSchema), controller.runMultiStockOptimization);
router.post("/ai-alternative", validateBody(AiAlternativeSchema), controller.getAiAlternative);
router.get("/reports", controller.getReports);

export const backtestRoutes = router;
