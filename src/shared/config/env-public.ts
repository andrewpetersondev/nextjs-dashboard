import { z } from "zod";
import { type LogLevel, LogLevelSchema } from "@/shared/logging/log-level";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_LOG_LEVEL: LogLevelSchema.optional(),
});

const parsed = publicEnvSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.flatten().fieldErrors;
  throw new Error(
    `Invalid public environment variables. See details:\n${JSON.stringify(details, null, 2)}`,
  );
}

const data = parsed.data;

const NODE_ENV = (process.env.NODE_ENV ?? "development").toLowerCase();

const PUBLIC_ENV = {
  LOG_LEVEL: data.NEXT_PUBLIC_LOG_LEVEL as LogLevel | undefined,
} as const;

export const IS_PROD: boolean = NODE_ENV === "production";
export const NEXT_PUBLIC_LOG_LEVEL = PUBLIC_ENV.LOG_LEVEL;
