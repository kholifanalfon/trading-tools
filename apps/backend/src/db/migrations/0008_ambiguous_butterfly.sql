ALTER TABLE "ai_analyses" DROP CONSTRAINT "ai_analyses_stock_id_stocks_id_fk";
--> statement-breakpoint
ALTER TABLE "ai_analyses" ALTER COLUMN "stock_id" DROP NOT NULL;