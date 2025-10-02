import "server-only";
import { z } from "zod";

// Narrow command schemas per action to prevent over-posting.
export const loginCommandSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
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
    password: z.string().min(8),
    username: z.string().min(3).max(50),
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
