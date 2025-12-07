import { z } from "zod";
import {
  EmailSchema,
  PasswordSchema,
  UsernameSchema,
} from "@/modules/auth/domain/auth.schema";
import { USER_ROLES } from "@/modules/auth/domain/roles/auth.roles";
import { getSchemaKeys } from "@/shared/forms/utilities/get-schema-keys";

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

// Zod Input (pre-parse) - Raw form values
export type CreateUserFormInput = z.input<typeof CreateUserFormSchema>;
export type CreateUserFormFieldNames = keyof CreateUserFormInput;
export type EditUserFormInput = z.input<typeof EditUserFormSchema>;
export type EditUserFormFieldNames = keyof EditUserFormInput;

// Zod Output (post-parse) - Validated domain data
export type CreateUserData = z.output<typeof CreateUserFormSchema>;
export type EditUserData = z.output<typeof EditUserFormSchema>;

export type CreateUserFormField = keyof CreateUserData;
export type EditUserFormField = keyof EditUserData;

export const CREATE_USER_FIELDS_LIST = getSchemaKeys(CreateUserFormSchema);
export const EDIT_USER_FIELDS_LIST = getSchemaKeys(EditUserFormSchema);
