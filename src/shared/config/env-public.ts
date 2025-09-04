import { z } from "zod";

// Helper: coerce stringy env flags to boolean
function toBool(v: unknown, fallback = false): boolean {
  if (typeof v !== "string") {
    return fallback;
  }
  const s = v.trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "on";
}

const publicEnvSchema = z.object({
  // Add your public variables here. Examples:
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .url("NEXT_PUBLIC_API_BASE_URL must be a URL"),
  NEXT_PUBLIC_APP_NAME: z.string().min(1, "NEXT_PUBLIC_APP_NAME is required"),

  // Optional feature flags (string -> boolean)
  NEXT_PUBLIC_ENABLE_EXPERIMENTS: z.string().optional(),

  // Public log level for browser bundles
  NEXT_PUBLIC_LOG_LEVEL: z
    .enum(["debug", "info", "warn", "error", "silent"])
    .optional(),
});

const parsed = publicEnvSchema.safeParse(process.env);
if (!parsed.success) {
  const details = parsed.error.flatten().fieldErrors;
  // This will surface during build for client bundles as well.
  throw new Error(
    `Invalid public environment variables. See details:\n${JSON.stringify(details, null, 2)}`,
  );
}

const data = parsed.data;

export const PUBLIC_ENV = {
  API_BASE_URL: data.NEXT_PUBLIC_API_BASE_URL,
  APP_NAME: data.NEXT_PUBLIC_APP_NAME,
  ENABLE_EXPERIMENTS: toBool(data.NEXT_PUBLIC_ENABLE_EXPERIMENTS, false),
  LOG_LEVEL: data.NEXT_PUBLIC_LOG_LEVEL,
} as const;

// Optionally export individually:
export const NEXT_PUBLIC_APP_NAME = PUBLIC_ENV.APP_NAME;
export const NEXT_PUBLIC_API_BASE_URL = PUBLIC_ENV.API_BASE_URL;
export const NEXT_PUBLIC_ENABLE_EXPERIMENTS = PUBLIC_ENV.ENABLE_EXPERIMENTS;
export const NEXT_PUBLIC_LOG_LEVEL = PUBLIC_ENV.LOG_LEVEL;
