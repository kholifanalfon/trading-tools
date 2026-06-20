ALTER TABLE "portfolio_assets" ADD COLUMN "take_profit" numeric(20, 4);--> statement-breakpoint
ALTER TABLE "portfolio_assets" ADD COLUMN "stop_loss" numeric(20, 4);--> statement-breakpoint
ALTER TABLE "portfolio_transactions" ADD COLUMN "take_profit" numeric(20, 4);--> statement-breakpoint
ALTER TABLE "portfolio_transactions" ADD COLUMN "stop_loss" numeric(20, 4);