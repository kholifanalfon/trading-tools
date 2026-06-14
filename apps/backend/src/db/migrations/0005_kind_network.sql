ALTER TABLE "stocks" ADD COLUMN "watchlist" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "stocks" ADD COLUMN "exchange" varchar(20) DEFAULT 'IDX' NOT NULL;