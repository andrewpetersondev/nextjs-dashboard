import { z } from "zod";
import {
  emailSchema,
  passwordSchema,
  usernameSchema,
} from "@/shared/auth/schema.shared";
import { roleSchema } from "@/shared/auth/zod";

const UserFormBaseSchema = z.object({
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
export type BaseUserFormFields = CreateUserInput;
export type BaseUserFormFieldNames = keyof CreateUserInput;

// Form Fields
// export type BaseUserFormFields = {
//   readonly email: string;
//   readonly password: string;
//   readonly role: AuthRole;
//   readonly username: string;
// };
// export type CreateUserFormFields = BaseUserFormFields;
// export type EditUserFormFields = Partial<CreateUserFormFields>;
// Form Field Names
// export type BaseUserFormFieldNames = keyof BaseUserFormFields;
// export type CreateUserFormFieldNames = keyof CreateUserFormFields;
// export type EditUserFormFieldNames = keyof EditUserFormFields;
