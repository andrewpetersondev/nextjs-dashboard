import type { z } from "zod";
import type {
  LoginRequestDto,
  LoginRequestSchema,
} from "@/modules/auth/application/schemas/login-request.schema";

/** Field names for type-safe error handling in UI */
export type LoginField = keyof LoginRequestDto;
/** The raw input from the form (before Zod parsing) */
export type LoginTransport = z.input<typeof LoginRequestSchema>;
