import "server-only";

// Prefer explicit DATABASE_ENV; fallback to NODE_ENV and normalize
export type DatabaseEnv = "development" | "test" | "production";
