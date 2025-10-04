import "server-only";
import { z } from "zod";

// Magic numbers for validation constraints
const PASSWORD_MIN_LENGTH = 8 as const;
const USERNAME_MIN_LENGTH = 3 as const;
const USERNAME_MAX_LENGTH = 50 as const;

// Narrow command schemas per action to prevent over-posting.
export const loginCommandSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(PASSWORD_MIN_LENGTH),
  })
  .strict();

export type LoginCommand = z.infer<typeof loginCommandSchema>;

// Helpers to export parse/safeParse consistently.
export const parseLoginCommand = (input: unknown): LoginCommand =>
  loginCommandSchema.parse(input);

export const safeParseLoginCommand = (
  input: unknown,
): ReturnType<typeof loginCommandSchema.safeParse> =>
  loginCommandSchema.safeParse(input);

export const safeParseAsyncLoginCommand = (
  input: unknown,
): ReturnType<typeof loginCommandSchema.safeParseAsync> =>
  loginCommandSchema.safeParseAsync(input);

export const signupCommandSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(PASSWORD_MIN_LENGTH),
    username: z.string().min(USERNAME_MIN_LENGTH).max(USERNAME_MAX_LENGTH),
  })
  .strict();

export type SignupCommand = z.infer<typeof signupCommandSchema>;

export const parseSignupCommand = (input: unknown): SignupCommand =>
  signupCommandSchema.parse(input);

export const safeParseSignupCommand = (
  input: unknown,
): ReturnType<typeof signupCommandSchema.safeParse> =>
  signupCommandSchema.safeParse(input);

export const safeParseAsyncSignupCommand = (
  input: unknown,
): ReturnType<typeof signupCommandSchema.safeParseAsync> =>
  signupCommandSchema.safeParseAsync(input);
