ALTER TABLE "demo_user_counters" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "demo_user_counters" ALTER COLUMN "role" SET DEFAULT 'GUEST'::text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER'::text;--> statement-breakpoint
DROP TYPE "public"."role";--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('ADMIN', 'GUEST', 'USER');--> statement-breakpoint
ALTER TABLE "demo_user_counters" ALTER COLUMN "role" SET DEFAULT 'GUEST'::"public"."role";--> statement-breakpoint
ALTER TABLE "demo_user_counters" ALTER COLUMN "role" SET DATA TYPE "public"."role" USING "role"::"public"."role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER'::"public"."role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."role" USING "role"::"public"."role";