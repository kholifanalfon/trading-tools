CREATE TABLE IF NOT EXISTS "scoring_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"strategy" varchar(50) NOT NULL,
	"parameter_name" varchar(100) NOT NULL,
	"value" double precision NOT NULL,
	"weight" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "backtest_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" varchar(50) NOT NULL,
	"strategy" varchar(50) NOT NULL,
	"parameters" jsonb NOT NULL,
	"metrics" jsonb NOT NULL,
	"trades" jsonb NOT NULL,
	"equity_curve" jsonb,
	"ai_insights" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "stock_data" ADD COLUMN "day_score" integer;--> statement-breakpoint
ALTER TABLE "stock_data" ADD COLUMN "swing_score" integer;--> statement-breakpoint
ALTER TABLE "stock_data" ADD COLUMN "position_score" integer;--> statement-breakpoint
ALTER TABLE "stock_data" ADD COLUMN "score_payload" jsonb;