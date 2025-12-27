import { z } from "zod";
import { USER_ROLES } from "@/shared/domain/user/user-role.types";
import { toSchemaKeys } from "@/shared/forms/logic/inspectors/zod-schema.inspector";
import { EmailSchema } from "@/shared/validation/zod/email.schema";
import { PasswordSchema } from "@/shared/validation/zod/password.schema";
import { UsernameSchema } from "@/shared/validation/zod/username.schema";

const toUndefinedIfEmptyString = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

function optionalEdit<T extends z.ZodType>(schema: T) {
  return z.preprocess(toUndefinedIfEmptyString, schema).optional();
}

const userRoleEnum = z.enum(USER_ROLES);

/**
 * Role schema: trims, uppercases, and validates against allowed roles.
 * Uses pipe to ensure validation runs on the normalized value.
 */
export const userRoleSchema = z
  .string()
  .trim()
  .toUpperCase()
  .pipe(userRoleEnum);

/**
 * Base schema for user forms (create).
 * Use strictObject to reject unknown keys early.
 */
export const UserFormBaseSchema = z.strictObject({
  email: EmailSchema, // already trims + lowercases via pipe
  password: PasswordSchema, // trims with strength rules
  role: userRoleSchema, // normalized + validated
  username: UsernameSchema, // trims + lowercases
});

export const CreateUserFormSchema = UserFormBaseSchema;

/**
 * Optional, preprocessed fields for edit.
 * Each field accepts empty string as "unset" and otherwise applies full normalization.
 */
export const emailEdit = optionalEdit(EmailSchema);
export const passwordEdit = optionalEdit(PasswordSchema);
export const roleEdit = optionalEdit(userRoleSchema);
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

export const CREATE_USER_FIELDS_LIST = toSchemaKeys(CreateUserFormSchema);
export const EDIT_USER_FIELDS_LIST = toSchemaKeys(EditUserFormSchema);
