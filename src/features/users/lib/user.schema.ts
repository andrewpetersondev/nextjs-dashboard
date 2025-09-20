import { z } from "zod";
import {
  emailSchema,
  passwordSchema,
  usernameSchema,
} from "@/features/auth/domain/auth.schema";
import { USER_ROLES } from "@/features/auth/domain/roles";
import { emptyToUndefined } from "@/shared/utils/string";

/**
 * Utility to create optional, preprocessed edit fields.
 */
function optionalEdit<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess(emptyToUndefined, schema.optional());
}

/**
 * Role schema: trims, uppercases, and validates against allowed roles.
 */
export const roleSchema = z
  .string()
  .trim()
  .toUpperCase()
  .pipe(
    z.enum(USER_ROLES, {
      error: (issue) =>
        issue.input === undefined ? "Role is required." : "Invalid user role.",
    }),
  );

/**
 * Base schema for user forms (create).
 */
export const UserFormBaseSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  role: roleSchema,
  username: usernameSchema,
});

export const CreateUserFormSchema = UserFormBaseSchema;

// Optional, preprocessed fields for edit
export const emailEdit = optionalEdit(emailSchema);
export const passwordEdit = optionalEdit(passwordSchema);
export const roleEdit = optionalEdit(roleSchema);
export const usernameEdit = optionalEdit(usernameSchema);

/**
 * Edit schema with all fields optional after preprocessing.
 */
export const EditUserFormSchema = z.object({
  email: emailEdit,
  password: passwordEdit,
  role: roleEdit,
  username: usernameEdit,
});

// UI/view-model types derived from the shared schema

// Zod Input (pre-parse)
export type CreateUserInput = z.input<typeof CreateUserFormSchema>;
export type CreateUserFormFieldNames = keyof CreateUserInput;
export type EditUserInput = z.input<typeof EditUserFormSchema>;
export type EditUserFormFieldNames = keyof EditUserInput;

// Zod Infer (post-parse)
export type EditUserFormValues = z.infer<typeof EditUserFormSchema>;

// Backwards compatibility
export type BaseUserFormFieldNames = keyof CreateUserInput;
