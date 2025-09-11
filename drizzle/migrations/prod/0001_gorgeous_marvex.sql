CREATE TABLE "account" (
	"access_token" text,
	"expires_at" integer,
	"id_token" text,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"scope" text,
	"session_state" text,
	"token_type" text,
	"type" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions" RENAME TO "session";--> statement-breakpoint
ALTER TABLE "session" RENAME COLUMN "expires_at" TO "expires";--> statement-breakpoint
ALTER TABLE "session" RENAME COLUMN "token" TO "session_token";--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "sessions_token_unique";--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_revenue_period_matches_date";--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "sessions_user_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "sessions_user_id_idx";--> statement-breakpoint
DROP INDEX "sessions_expires_at_idx";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" timestamp;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_expires_idx" ON "session" USING btree ("expires");--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_revenue_period_matches_date" CHECK ("invoices"."revenue_period" = date_trunc('month',"invoices"."date")::date);