import {
  type ZodEmail,
  type ZodObject,
  type ZodOptional,
  type ZodString,
  z,
} from "zod";
import { roleSchema } from "@/shared/auth/zod";
import { DEFAULT_USER_SCHEMA } from "@/shared/constants/schema-defaults";

export const usernameSchema: ZodString = z
  .string()
  .min(DEFAULT_USER_SCHEMA.USERNAME_MIN_LENGTH, {
    error: "Username must be at least three characters long.",
  })
  .max(DEFAULT_USER_SCHEMA.USERNAME_MAX_LENGTH, {
    error: "Username cannot exceed 20 characters.",
  })
  .trim();

export const emailSchema: ZodEmail = z
  .email({ error: "Please enter a valid email address." })
  .trim();

export const passwordSchema: ZodString = z
  .string()
  .min(DEFAULT_USER_SCHEMA.PASSWORD_MIN_LENGTH, {
    error: "Password must be at least 5 characters long.",
  })
  .max(DEFAULT_USER_SCHEMA.PASSWORD_MAX_LENGTH, {
    error: "Password cannot exceed 32 characters.",
  })
  .regex(/[a-zA-Z]/, { error: "Password must contain a letter." })
  .regex(/[0-9]/, { error: "Password must contain a number." })
  .regex(/[^a-zA-Z0-9]/, {
    error: "Password must contain a special character.",
  })
  .trim();

export const CreateUserFormSchema: ZodObject<{
  email: ZodEmail;
  password: ZodString;
  role: typeof roleSchema;
  username: ZodString;
}> = z.object({
  email: emailSchema,
  password: passwordSchema,
  role: roleSchema,
  username: usernameSchema,
});

export const SignupFormSchema: ZodObject<{
  email: ZodEmail;
  password: ZodString;
  username: ZodString;
}> = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema,
});

export const LoginFormSchema: ZodObject<{
  email: ZodEmail;
  password: ZodString;
}> = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const EditUserFormSchema: ZodObject<{
  email: ZodOptional<ZodEmail>;
  password: ZodOptional<ZodString>;
  role: ZodOptional<typeof roleSchema>;
  username: ZodOptional<ZodString>;
}> = z.object({
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
  role: roleSchema.optional(),
  username: usernameSchema.optional(),
});

export const SignupAllowedFields = ["username", "email", "password"] as const;
export const LoginAllowedFields = ["email", "password"] as const;
