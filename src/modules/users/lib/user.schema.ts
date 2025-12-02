import { z } from "zod";
import { USER_ROLES } from "@/modules/auth/domain/auth.roles";
import {
  EmailSchema,
  PasswordSchema,
  UsernameSchema,
} from "@/modules/auth/lib/auth.schema";

const toUndefinedIfEmptyString = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

/**
 * Utility to create optional, preprocessed edit fields.
 *
 * - Converts empty strings to undefined (so optional() works for HTML forms).
 * - Wraps with .optional() at the end to preserve inner transforms.
 */
function optionalEdit<T extends z.ZodType>(schema: T) {
  return z.preprocess(toUndefinedIfEmptyString, schema).optional();
}

/**
 * Role schema: trims, uppercases, and validates against allowed roles.
 * Uses pipe to ensure validation runs on the normalized value.
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
 * Use strictObject to reject unknown keys early.
 */
export const UserFormBaseSchema = z.strictObject({
  email: EmailSchema, // already trims + lowercases via pipe
  password: PasswordSchema, // trims with strength rules
  role: roleSchema, // normalized + validated
  username: UsernameSchema, // trims + lowercases
});

export const CreateUserFormSchema = UserFormBaseSchema;

/**
 * Optional, preprocessed fields for edit.
 * Each field accepts empty string as "unset" and otherwise applies full normalization.
 */
export const emailEdit = optionalEdit(EmailSchema);
export const passwordEdit = optionalEdit(PasswordSchema);
export const roleEdit = optionalEdit(roleSchema);
export const usernameEdit = optionalEdit(UsernameSchema);

/**
 * Edit schema with all fields optional after preprocessing.
 * strictObject ensures unknown keys are rejected.
 */
export const EditUserFormSchema = z.strictObject({
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

// Zod Output (post-parse)
export type EditUserFormValues = z.output<typeof EditUserFormSchema>;
