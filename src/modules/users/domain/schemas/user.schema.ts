import { z } from "zod";
import { toSchemaKeys } from "@/shared/forms/logic/inspectors/zod-schema.inspector";
import { UserRoleFormSchema } from "@/shared/validation/user/user-role.schema";
import { EmailSchema } from "@/shared/validation/zod/email.schema";
import { PasswordSchema } from "@/shared/validation/zod/password.schema";
import { UsernameSchema } from "@/shared/validation/zod/username.schema";

// biome-ignore lint/nursery/useExplicitType: fix later
const toUndefinedIfEmptyString = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

// biome-ignore lint/nursery/useExplicitType: fix later
function optionalEdit<T extends z.ZodType>(schema: T) {
  return z.preprocess(toUndefinedIfEmptyString, schema).optional();
}

/**
 * Base schema for user forms (create).
 * Use strictObject to reject unknown keys early.
 */
// biome-ignore lint/nursery/useExplicitType: fix later
export const UserFormBaseSchema = z.strictObject({
  email: EmailSchema, // already trims + lowercases via pipe
  password: PasswordSchema, // trims with strength rules
  role: UserRoleFormSchema, // normalized + validated
  username: UsernameSchema, // trims + lowercases
});

// biome-ignore lint/nursery/useExplicitType: fix later
export const CreateUserFormSchema = UserFormBaseSchema;

/**
 * Optional, preprocessed fields for edit.
 * Each field accepts empty string as "unset" and otherwise applies full normalization.
 */
// biome-ignore lint/nursery/useExplicitType: fix later
export const emailEdit = optionalEdit(EmailSchema);
// biome-ignore lint/nursery/useExplicitType: fix later
export const passwordEdit = optionalEdit(PasswordSchema);
// biome-ignore lint/nursery/useExplicitType: fix later
export const roleEdit = optionalEdit(UserRoleFormSchema);
// biome-ignore lint/nursery/useExplicitType: fix later
export const usernameEdit = optionalEdit(UsernameSchema);

/**
 * Edit schema with all fields optional after preprocessing.
 * strictObject ensures unknown keys are rejected.
 */
// biome-ignore lint/nursery/useExplicitType: fix later
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

export const CREATE_USER_FIELDS_LIST: readonly CreateUserFormField[] =
  toSchemaKeys(CreateUserFormSchema);

export const EDIT_USER_FIELDS_LIST: readonly EditUserFormField[] =
  toSchemaKeys(EditUserFormSchema);
