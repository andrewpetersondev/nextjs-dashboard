ALTER TABLE "revenues" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "revenues" CASCADE;--> statement-breakpoint
DROP TYPE "public"."calculation_source";