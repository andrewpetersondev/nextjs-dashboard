import { z } from "zod";
import {
  emailSchema,
  passwordSchema,
  usernameSchema,
} from "@/features/auth/domain/auth.schema";
import { AUTH_ROLES } from "@/features/auth/domain/roles";
import { emptyToUndefined } from "@/shared/utils/string";

export const roleSchema = z
  .string()
  .trim()
  .toUpperCase()
  .pipe(
    z.enum(AUTH_ROLES, {
      error: (issue) =>
        issue.input === undefined ? "Role is required." : "Invalid user role.",
    }),
  );

export const UserFormBaseSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  role: roleSchema,
  username: usernameSchema,
});

export const CreateUserFormSchema = UserFormBaseSchema;

// Optional, preprocessed fields for edit
export const emailEdit = z.preprocess(emptyToUndefined, emailSchema.optional());
export const passwordEdit = z.preprocess(
  emptyToUndefined,
  passwordSchema.optional(),
);
export const roleEdit = z.preprocess(emptyToUndefined, roleSchema.optional());
export const usernameEdit = z.preprocess(
  emptyToUndefined,
  usernameSchema.optional(),
);

export const EditUserFormSchema = z.object({
  email: emailEdit,
  password: passwordEdit,
  role: roleEdit,
  username: usernameEdit,
});

// UI/view-model types derived from the shared schema
// Zod Input
// z.input extracts the input type expected by the schema,
// which can differ from the output type if the schema transforms the data.
export type CreateUserInput = z.input<typeof CreateUserFormSchema>;
export type CreateUserFormFieldNames = keyof CreateUserInput;
export type EditUserInput = z.input<typeof EditUserFormSchema>;
export type EditUserFormFieldNames = keyof EditUserInput;

// Zod Infer
// z.infer is a utility type that extracts the output type of a Zod schema,
// reflecting the type you get after parsing data with the schema.
export type EditUserFormValues = z.infer<typeof EditUserFormSchema>;

// for backwards compatibility
export type BaseUserFormFieldNames = keyof CreateUserInput;
