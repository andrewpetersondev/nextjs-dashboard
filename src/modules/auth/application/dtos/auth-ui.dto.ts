import type {
  AuthLoginSchemaDto,
  AuthSignupSchemaDto,
} from "@/modules/auth/domain/schemas/auth-user.schema";

/** Field names for type-safe error handling in UI */
export type LoginField = keyof AuthLoginSchemaDto;
/** Field names for type-safe error handling in UI */
export type SignupField = keyof AuthSignupSchemaDto;
