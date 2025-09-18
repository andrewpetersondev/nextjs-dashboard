import { z } from "zod";
import { AUTH_ROLES } from "@/features/auth/domain/roles";
import {
  emailSchema,
  passwordSchema,
  usernameSchema,
} from "@/features/auth/domain/schema.shared";

//export const roleSchema = z.enum(AUTH_ROLES, {
//  error: (issue) =>
//    issue.input === undefined ? "Role is required." : "Invalid user role.",
//});

export const roleSchema = z
  .string()
  .trim()
  .toLowerCase()
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

// For edit: treat empty strings as "not provided" so partial updates work.
// Helper: convert "" (or whitespace-only) to undefined
export const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

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
export type CreateUserInput = z.input<typeof CreateUserFormSchema>;
export type CreateUserFormFieldNames = keyof CreateUserInput;
export type EditUserInput = z.input<typeof EditUserFormSchema>;
export type EditUserFormFieldNames = keyof EditUserInput;

// for backwards compatibility
export type BaseUserFormFieldNames = keyof CreateUserInput;
