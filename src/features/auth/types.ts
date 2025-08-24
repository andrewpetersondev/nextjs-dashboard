// Client-safe definitions. Do not import from server modules here.

export type BaseUserFormFields = {
  email: string;
  password: string;
};

export type LoginFormFields = BaseUserFormFields;
export type SignupFormFields = BaseUserFormFields & {
  username: string;
};

export type SignupFormFieldNames = keyof SignupFormFields;
export type LoginFormFieldNames = keyof LoginFormFields;
