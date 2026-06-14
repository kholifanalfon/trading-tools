CREATE TABLE IF NOT EXISTS "stock_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"stock_id" integer NOT NULL,
	"symbol" varchar(10) NOT NULL,
	"date" timestamp NOT NULL,
	"open" double precision NOT NULL,
	"high" double precision NOT NULL,
	"low" double precision NOT NULL,
	"close" double precision NOT NULL,
	"volume" double precision NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stock_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" varchar(20) NOT NULL,
	"message" text,
	"symbols_count" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "symbol_date_idx" ON "stock_data" ("symbol","date");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_data" ADD CONSTRAINT "stock_data_stock_id_stocks_id_fk" FOREIGN KEY ("stock_id") REFERENCES "stocks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
