import { Router } from "express";
import { StocksController } from "./stocks.controller";
import { requireAuth } from "@/core/middlewares/auth.middleware";
import { validateBody, validateQuery } from "@/core/middlewares/validation.middleware";
import { CreateStockSchema, UpdateStockSchema, StockQuerySchema } from "./stocks.schema";

const router = Router();
const controller = new StocksController();

router.use(requireAuth);

router.get("/", validateQuery(StockQuerySchema), controller.getStocks);
router.get("/:id", controller.getStockById);
router.post("/", validateBody(CreateStockSchema), controller.createStock);
router.put("/:id", validateBody(UpdateStockSchema), controller.updateStock);
router.delete("/:id", controller.deleteStock);

export const stocksRoutes = router;
