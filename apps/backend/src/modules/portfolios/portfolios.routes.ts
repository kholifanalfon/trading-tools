import { Router } from "express";
import { PortfoliosController } from "./portfolios.controller";
import { requireAuth } from "@/core/middlewares/auth.middleware";
import { validateBody } from "@/core/middlewares/validation.middleware";
import { CreatePortfolioSchema, UpdatePortfolioSchema, AddTransactionSchema } from "./portfolios.schema";

const router = Router();
const controller = new PortfoliosController();

router.use(requireAuth);

router.get("/assets/all", controller.getAllAssets);
router.get("/", controller.getPortfolios);
router.post("/", validateBody(CreatePortfolioSchema), controller.createPortfolio);
router.get("/:id", controller.getPortfolioById);
router.put("/:id", validateBody(UpdatePortfolioSchema), controller.updatePortfolio);
router.delete("/:id", controller.deletePortfolio);
router.post("/:id/transactions", validateBody(AddTransactionSchema), controller.addTransaction);
router.get("/assets/summary/:symbol", controller.getPortfoliosAssetSummary);

export const portfoliosRoutes = router;
