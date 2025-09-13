import { z } from "zod";

export const ENVIRONMENTS = ["development", "test", "production"] as const;
export type DatabaseEnv = (typeof ENVIRONMENTS)[number];
export const DatabaseEnvEnum = z.enum(ENVIRONMENTS);

export type NodeEnv = (typeof ENVIRONMENTS)[number];

export const NodeEnvSchema = z.enum(ENVIRONMENTS);

/**
 * Resolve and validate NODE_ENV in a safe, centralized way.
 * - Lowercases the value
 * - Falls back to "development" if invalid or missing
 */
export function getNodeEnv(): NodeEnv {
  const raw = (process.env.NODE_ENV ?? "development").toLowerCase();
  const parsed = NodeEnvSchema.safeParse(raw);
  return parsed.success ? parsed.data : "development";
}

/** Convenience helpers */
export const isProd = (): boolean => getNodeEnv() === "production";
export const isTest = (): boolean => getNodeEnv() === "test";
export const isDev = (): boolean => getNodeEnv() === "development";

// ... existing code ...

/**
 * Resolve and validate DATABASE_ENV (runtime environment used by the database/config).
 * - Lowercases the value
 * - Falls back to NODE_ENV if missing
 * - Falls back to "development" if still invalid
 */
export function getDatabaseEnv(): DatabaseEnv {
  const fallback = getNodeEnv();
  const raw = (process.env.DATABASE_ENV ?? fallback).toLowerCase();
  const parsed = DatabaseEnvEnum.safeParse(raw);
  return parsed.success ? parsed.data : "development";
}

/** Convenience helpers for DATABASE_ENV */
export const isDbProd = (): boolean => getDatabaseEnv() === "production";
export const isDbTest = (): boolean => getDatabaseEnv() === "test";
export const isDbDev = (): boolean => getDatabaseEnv() === "development";
