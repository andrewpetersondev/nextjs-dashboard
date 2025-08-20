import * as z from "zod";
import { USER_ROLES } from "@/features/users/user.types";

/**
 * Username validation schema.
 */
export const usernameSchema = z
  .string()
  .min(3, { error: "Username must be at least three characters long." })
  .max(20, { error: "Username cannot exceed 20 characters." })
  .trim();

/**
 * Email validation schema.
 */
export const emailSchema = z
  .email({ error: "Please enter a valid email address." })
  .trim();

/**
 * User role validation schema.
 */
export const roleSchema = z.enum(USER_ROLES, {
  error: (issue) =>
    issue.input === undefined ? "Role is required." : "Invalid user role.",
});

/**
 * Password validation schema.
 */
export const passwordSchema = z
  .string()
  .min(5, { error: "Password must be at least 5 characters long." })
  .max(32, { error: "Password cannot exceed 32 characters." })
  .regex(/[a-zA-Z]/, { error: "Password must contain a letter." })
  .regex(/[0-9]/, { error: "Password must contain a number." })
  .regex(/[^a-zA-Z0-9]/, {
    error: "Password must contain a special character.",
  })
  .trim();

/**
 * Validation schema for creating a user (admin).
 */
export const CreateUserFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  role: roleSchema,
  username: usernameSchema,
});

/**
 * Validation schema for user signup.
 */
export const SignupFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema,
});

/**
 * Validation schema for user login.
 */
export const LoginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/**
 * Validation schema for editing a user.
 */
export const EditUserFormSchema = z.object({
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
  role: roleSchema.optional(),
  username: usernameSchema.optional(),
});

export const SignupAllowedFields = ["username", "email", "password"] as const;
