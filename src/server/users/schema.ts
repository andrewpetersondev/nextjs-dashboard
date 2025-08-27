import "server-only";

import { z } from "zod";
import { roleSchema } from "@/shared/auth/zod";
import { DEFAULT_USER_SCHEMA } from "@/shared/users/constants";

// Server-only zod schemas for user actions/entities

export const usernameServerSchema = z
  .string()
  .min(DEFAULT_USER_SCHEMA.USERNAME_MIN_LENGTH, {
    error: "Username must be at least three characters long.",
  })
  .max(DEFAULT_USER_SCHEMA.USERNAME_MAX_LENGTH, {
    error: "Username cannot exceed 20 characters.",
  })
  .trim();

export const emailServerSchema = z
  .string()
  .email({ error: "Please enter a valid email address." })
  .trim();

export const passwordServerSchema = z
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

export const UserBaseServerSchema = z.object({
  email: emailServerSchema,
  role: roleSchema,
  username: usernameServerSchema,
});

export const CreateUserServerSchema = UserBaseServerSchema.extend({
  password: passwordServerSchema,
});

export const UpdateUserServerSchema = z.object({
  email: emailServerSchema.optional(),
  password: passwordServerSchema.optional(),
  role: roleSchema.optional(),
  username: usernameServerSchema.optional(),
});
