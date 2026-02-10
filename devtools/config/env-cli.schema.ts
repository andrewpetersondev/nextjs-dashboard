import { z } from "zod";
import { DatabaseEnvironmentSchema } from "@/shared/config/env-schemas";

// biome-ignore lint/nursery/useExplicitType: <fix later>
export const ToolingEnvShape = z.object({
  cypressBaseUrl: z.url(),
  databaseEnv: DatabaseEnvironmentSchema,
  databaseUrl: z.string().min(1),
  sessionSecret: z.string().min(1),
});
