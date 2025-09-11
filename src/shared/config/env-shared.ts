import { z } from "zod";

export const ENVIRONMENTS = ["development", "test", "production"] as const;
export type DatabaseEnv = (typeof ENVIRONMENTS)[number];
export const DatabaseEnvEnum = z.enum(ENVIRONMENTS);
