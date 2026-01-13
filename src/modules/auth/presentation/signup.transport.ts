import type { z } from "zod";
import type {
  SignupRequestDto,
  SignupRequestSchema,
} from "@/modules/auth/application/schemas/login-request.schema";

/** Field names for type-safe error handling in UI */
export type SignupField = keyof SignupRequestDto;
/** The raw input from the form (before Zod parsing) */
export type SignupTransport = z.input<typeof SignupRequestSchema>;
