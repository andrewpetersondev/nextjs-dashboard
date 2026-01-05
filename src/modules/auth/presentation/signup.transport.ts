import type { z } from "zod";
import type {
  AuthSignupSchemaDto,
  SignupSchema,
} from "@/modules/auth/domain/schemas/auth-user.schema";

/** Field names for type-safe error handling in UI */
export type SignupField = keyof AuthSignupSchemaDto;
/** The raw input from the form (before Zod parsing) */
export type SignupTransport = z.input<typeof SignupSchema>;
