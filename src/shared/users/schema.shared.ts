import {
  type ZodEmail,
  type ZodObject,
  type ZodOptional,
  type ZodString,
  z,
} from "zod";
import {
  emailSchema,
  passwordSchema,
  usernameSchema,
} from "@/shared/auth/schema.shared";
import { roleSchema } from "@/shared/auth/zod";

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
