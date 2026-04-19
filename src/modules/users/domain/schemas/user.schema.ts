import { z } from "zod";
import { EmailSchema } from "@/shared/policies/email/email.schema";
import { PasswordSchema } from "@/shared/policies/password/password.schema";
import { UserRoleFormSchema } from "@/shared/policies/user-role/user-role.schema";
import { UsernameSchema } from "@/shared/policies/username/username.schema";

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
const UserFormBaseSchema = z.strictObject({
	email: EmailSchema, // already trims + lowercases via pipe
	password: PasswordSchema, // trims with strength rules
	role: UserRoleFormSchema, // normalized + validated
	username: UsernameSchema, // trims + lowercases
});

/**
 * Optional, preprocessed fields for edit.
 * Each field accepts empty string as "unset" and otherwise applies full normalization.
 */
const emailEdit = optionalEdit(EmailSchema);
const passwordEdit = optionalEdit(PasswordSchema);
const roleEdit = optionalEdit(UserRoleFormSchema);
const usernameEdit = optionalEdit(UsernameSchema);

// biome-ignore lint/nursery/useExplicitType: fix later
export const CreateUserFormSchema = UserFormBaseSchema;

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
export type EditUserFormInput = z.input<typeof EditUserFormSchema>;
export type EditUserFormFieldNames = keyof EditUserFormInput;

// Zod Output (post-parse) - Validated domain data
export type CreateUserData = z.output<typeof CreateUserFormSchema>;
export type EditUserData = z.output<typeof EditUserFormSchema>;
