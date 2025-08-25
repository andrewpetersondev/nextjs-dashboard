// TODO: should these be readonly?
export type BaseUserFormFields = {
  email: string;
  password: string;
};

export type LoginFormFields = BaseUserFormFields;
// TODO: why is this not readonly?
export type SignupFormFields = BaseUserFormFields & {
  username: string;
};

export type SignupFormFieldNames = keyof SignupFormFields;
export type LoginFormFieldNames = keyof LoginFormFields;
