ALTER TABLE "revenues" ADD COLUMN "total_paid_amount" bigint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "revenues" ADD COLUMN "total_pending_amount" bigint DEFAULT 0 NOT NULL;