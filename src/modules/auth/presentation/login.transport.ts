import type { z } from "zod";
import type {
  AuthLoginSchemaDto,
  LoginSchema,
} from "@/modules/auth/domain/schemas/auth-user.schema";

/** Field names for type-safe error handling in UI */
export type LoginField = keyof AuthLoginSchemaDto;
/** The raw input from the form (before Zod parsing) */
export type LoginTransport = z.input<typeof LoginSchema>;
