import { z } from "zod";
import { AUTH_ROLES } from "@/features/auth/domain/roles";
import {
  emailSchema,
  passwordSchema,
  usernameSchema,
} from "@/features/auth/domain/schema.shared";

export const roleSchema = z.enum(AUTH_ROLES, {
  error: (issue) =>
    issue.input === undefined ? "Role is required." : "Invalid user role.",
});

export const UserFormBaseSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  role: roleSchema,
  username: usernameSchema,
});

export const CreateUserFormSchema = UserFormBaseSchema;
export const EditUserFormSchema = CreateUserFormSchema.partial();

// UI/view-model types derived from the shared schema
export type CreateUserInput = z.input<typeof CreateUserFormSchema>;
export type CreateUserFormFieldNames = keyof CreateUserInput;
export type EditUserInput = z.input<typeof EditUserFormSchema>;
export type EditUserFormFieldNames = keyof EditUserInput;

// for backwards compatibility
export type BaseUserFormFieldNames = keyof CreateUserInput;
