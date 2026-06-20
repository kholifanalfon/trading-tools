CREATE TABLE IF NOT EXISTS "portfolio_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"portfolio_id" integer NOT NULL,
	"symbol" varchar(10) NOT NULL,
	"quantity" numeric(20, 4) DEFAULT '0' NOT NULL,
	"average_purchase_price" numeric(20, 4) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "portfolio_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"portfolio_id" integer NOT NULL,
	"symbol" varchar(10),
	"type" varchar(20) NOT NULL,
	"quantity" numeric(20, 4),
	"price" numeric(20, 4),
	"fee" numeric(20, 4) DEFAULT '0' NOT NULL,
	"transaction_date" timestamp DEFAULT now() NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "portfolios" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"balance" numeric(20, 4) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trading_journals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"portfolio_id" integer,
	"transaction_id" integer,
	"symbol" varchar(10) NOT NULL,
	"direction" varchar(10) NOT NULL,
	"entry_date" timestamp DEFAULT now() NOT NULL,
	"exit_date" timestamp,
	"entry_price" numeric(20, 4) NOT NULL,
	"exit_price" numeric(20, 4),
	"quantity" numeric(20, 4) NOT NULL,
	"status" varchar(20) DEFAULT 'OPEN' NOT NULL,
	"pnl" numeric(20, 4),
	"setup" varchar(100),
	"notes" text,
	"emotions" varchar(100),
	"rating" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "stock_data" ALTER COLUMN "stock_id" SET NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "portfolio_assets" ADD CONSTRAINT "portfolio_assets_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "portfolios"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "portfolio_transactions" ADD CONSTRAINT "portfolio_transactions_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "portfolios"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trading_journals" ADD CONSTRAINT "trading_journals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trading_journals" ADD CONSTRAINT "trading_journals_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "portfolios"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trading_journals" ADD CONSTRAINT "trading_journals_transaction_id_portfolio_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "portfolio_transactions"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
