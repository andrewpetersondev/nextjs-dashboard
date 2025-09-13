import { type ZodEmail, type ZodString, z } from "zod";
import {
  EMAIL_ERROR,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MAX_LENGTH_ERROR,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_LENGTH_ERROR,
  PASSWORD_RULE_REGEX_CONTAIN_LETTER,
  PASSWORD_RULE_REGEX_CONTAIN_NUMBER,
  PASSWORD_RULE_REGEX_CONTAIN_SPECIAL_CHARACTER,
  PASSWORD_RULE_REGEX_ERROR_LETTER,
  PASSWORD_RULE_REGEX_ERROR_NUMBER,
  PASSWORD_RULE_REGEX_ERROR_SPECIAL_CHARACTER,
  USERNAME_MAX_LENGTH,
  USERNAME_MAX_LENGTH_ERROR,
  USERNAME_MIN_LENGTH,
  USERNAME_MIN_LENGTH_ERROR,
} from "@/features/auth/constants";

export const usernameSchema: ZodString = z
  .string()
  .min(USERNAME_MIN_LENGTH, {
    error: USERNAME_MIN_LENGTH_ERROR,
  })
  .max(USERNAME_MAX_LENGTH, {
    error: USERNAME_MAX_LENGTH_ERROR,
  })
  .trim();

export const emailSchema: ZodEmail = z.email({ error: EMAIL_ERROR }).trim();

export const passwordSchema: ZodString = z
  .string()
  .min(PASSWORD_MIN_LENGTH, {
    error: PASSWORD_MIN_LENGTH_ERROR,
  })
  .max(PASSWORD_MAX_LENGTH, {
    error: PASSWORD_MAX_LENGTH_ERROR,
  })
  .regex(PASSWORD_RULE_REGEX_CONTAIN_LETTER, {
    error: PASSWORD_RULE_REGEX_ERROR_LETTER,
  })
  .regex(PASSWORD_RULE_REGEX_CONTAIN_NUMBER, {
    error: PASSWORD_RULE_REGEX_ERROR_NUMBER,
  })
  .regex(PASSWORD_RULE_REGEX_CONTAIN_SPECIAL_CHARACTER, {
    error: PASSWORD_RULE_REGEX_ERROR_SPECIAL_CHARACTER,
  })
  .trim();

export const AuthFormBaseSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const LoginFormSchema = AuthFormBaseSchema;

export const SignupFormSchema = AuthFormBaseSchema.extend({
  username: usernameSchema,
});

// UI/view-model types derived from the shared schema
export type LoginFormInput = z.input<typeof LoginFormSchema>;
export type LoginFormFieldNames = keyof LoginFormInput;
export type SignupFormInput = z.input<typeof SignupFormSchema>;
export type SignupFormFieldNames = keyof SignupFormInput;

// Derive the runtime field list once from the schema to avoid scattering literals/types
export const SIGNUP_FIELDS = Object.keys(
  SignupFormSchema.shape,
) as readonly SignupFormFieldNames[];

// Derive the runtime field list once from the schema to avoid scattering literals/types
export const LOGIN_FIELDS = Object.keys(
  LoginFormSchema.shape,
) as readonly LoginFormFieldNames[];
