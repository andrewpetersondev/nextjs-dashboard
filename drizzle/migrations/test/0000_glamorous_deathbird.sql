CREATE TYPE "public"."status" AS ENUM('pending', 'paid');--> statement-breakpoint
CREATE TYPE "public"."calculation_source" AS ENUM('seed', 'handler', 'invoice_event', 'rolling_calculation', 'template');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'user', 'guest');--> statement-breakpoint
CREATE TABLE "customers" (
	"email" varchar(255) NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"image_url" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"sensitive_data" varchar(255) DEFAULT 'cantTouchThis' NOT NULL,
	CONSTRAINT "customers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "demo_user_counters" (
	"count" integer DEFAULT 0 NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"role" "role" DEFAULT 'guest' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"amount" bigint NOT NULL,
	"customer_id" uuid NOT NULL,
	"date" date NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"revenue_period" date NOT NULL,
	"sensitive_data" varchar(255) DEFAULT 'cantTouchThis' NOT NULL,
	"status" "status" DEFAULT 'pending' NOT NULL,
	CONSTRAINT "invoices_amount_non_negative" CHECK ("invoices"."amount" >= 0),
	CONSTRAINT "invoices_revenue_period_matches_date" CHECK ("invoices"."revenue_period" = date_trunc('month', "invoices"."date")::date)
);
--> statement-breakpoint
CREATE TABLE "revenues" (
	"calculation_source" "calculation_source" DEFAULT 'seed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_count" integer DEFAULT 0 NOT NULL,
	"period" date NOT NULL,
	"total_amount" bigint DEFAULT 0 NOT NULL,
	"total_paid_amount" bigint DEFAULT 0 NOT NULL,
	"total_pending_amount" bigint DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "revenues_period_unique" UNIQUE("period"),
	CONSTRAINT "revenues_period_is_first_of_month" CHECK (extract(day from "revenues"."period") = 1),
	CONSTRAINT "revenues_total_amount_non_negative" CHECK ("revenues"."total_amount" >= 0),
	CONSTRAINT "revenues_invoice_count_non_negative" CHECK ("revenues"."invoice_count" >= 0),
	CONSTRAINT "revenues_total_paid_non_negative" CHECK ("revenues"."total_paid_amount" >= 0),
	CONSTRAINT "revenues_total_pending_non_negative" CHECK ("revenues"."total_pending_amount" >= 0),
	CONSTRAINT "revenues_paid_plus_pending_lte_total" CHECK ("revenues"."total_paid_amount" + "revenues"."total_pending_amount" <= "revenues"."total_amount")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"email" varchar(255) NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" "role" DEFAULT 'user' NOT NULL,
	"sensitive_data" varchar(255) DEFAULT 'cantTouchThis' NOT NULL,
	"username" varchar(50) NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_revenue_period_revenues_period_fk" FOREIGN KEY ("revenue_period") REFERENCES "public"."revenues"("period") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invoices_customer_id_idx" ON "invoices" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "invoices_revenue_period_idx" ON "invoices" USING btree ("revenue_period");--> statement-breakpoint
CREATE INDEX "invoices_customer_id_status_idx" ON "invoices" USING btree ("customer_id","status");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");