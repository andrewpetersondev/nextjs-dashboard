import { z } from "zod";
import { DatabaseEnvironmentSchema } from "@/shared/infrastructure/config/env-schemas";

export const ToolingEnvShape = z.object({
  cypressBaseUrl: z.url(),
  databaseEnv: DatabaseEnvironmentSchema,
  databaseUrl: z.string().min(1),
  sessionSecret: z.string().min(1),
});
