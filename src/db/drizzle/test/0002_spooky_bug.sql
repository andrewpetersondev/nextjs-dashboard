CREATE TABLE "demo_user_counters" (
	"id" serial PRIMARY KEY NOT NULL,
	"role" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL
);
