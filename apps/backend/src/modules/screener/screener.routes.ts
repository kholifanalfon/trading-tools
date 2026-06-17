import { Router } from "express";
import { ScreenerController } from "./screener.controller";
import { requireAuth } from "@/core/middlewares/auth.middleware";
import { validateQuery, validateBody } from "@/core/middlewares/validation.middleware";
import { StockSearchQuerySchema, StockQuoteQuerySchema, StockDataQuerySchema, SyncHistoryBodySchema } from "./screener.schema";

const router = Router();
const controller = new ScreenerController();

router.use(requireAuth);

router.get("/search", validateQuery(StockSearchQuerySchema), controller.searchStocks);
router.get("/quote", validateQuery(StockQuoteQuerySchema), controller.getQuote);
router.get("/data", validateQuery(StockDataQuerySchema), controller.getStockData);
router.get("/data/:symbol", controller.getStockHistoricalData);
router.get("/ai-analysis/:symbol", controller.getAiAnalysis);
router.post("/ai-analysis/:symbol", controller.refreshAiAnalysis);
router.post("/sync-history", validateBody(SyncHistoryBodySchema), controller.startHistoricalSync);
router.get("/sync-history/status", controller.getHistoricalSyncStatus);
router.get("/sync-history/logs", controller.getSyncLogs);

export const screenerRoutes = router;
