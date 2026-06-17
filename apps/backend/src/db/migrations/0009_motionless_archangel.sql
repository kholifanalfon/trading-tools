ALTER TABLE "ai_analyses" ADD COLUMN "ai_day_score" double precision;--> statement-breakpoint
ALTER TABLE "ai_analyses" ADD COLUMN "ai_swing_score" double precision;--> statement-breakpoint
ALTER TABLE "ai_analyses" ADD COLUMN "ai_position_score" double precision;--> statement-breakpoint
ALTER TABLE "ai_analyses" ADD COLUMN "score_verdict" varchar(20);