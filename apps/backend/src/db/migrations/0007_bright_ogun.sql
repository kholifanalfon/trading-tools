CREATE TABLE IF NOT EXISTS "ai_analyses" (
	"id" serial PRIMARY KEY NOT NULL,
	"stock_id" integer NOT NULL,
	"symbol" varchar(10) NOT NULL,
	"prediction" varchar(20) NOT NULL,
	"recommendation" varchar(20) NOT NULL,
	"confidence" double precision NOT NULL,
	"analysis_detail" text NOT NULL,
	"score_comparison" text NOT NULL,
	"macro_economics" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ai_analyses_symbol_unique" UNIQUE("symbol")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ai_analyses" ADD CONSTRAINT "ai_analyses_stock_id_stocks_id_fk" FOREIGN KEY ("stock_id") REFERENCES "stocks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
