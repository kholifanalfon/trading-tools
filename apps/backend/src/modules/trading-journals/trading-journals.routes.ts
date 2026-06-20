import { Router } from "express";
import { TradingJournalsController } from "./trading-journals.controller";
import { requireAuth } from "@/core/middlewares/auth.middleware";
import { validateBody } from "@/core/middlewares/validation.middleware";
import { CreateTradingJournalSchema, UpdateTradingJournalSchema } from "./trading-journals.schema";

const router = Router();
const controller = new TradingJournalsController();

router.use(requireAuth);

router.get("/", controller.getJournals);
router.post("/", validateBody(CreateTradingJournalSchema), controller.createJournal);
router.get("/:id", controller.getJournalById);
router.put("/:id", validateBody(UpdateTradingJournalSchema), controller.updateJournal);
router.delete("/:id", controller.deleteJournal);

export const tradingJournalsRoutes = router;
