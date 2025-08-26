// TODO: should these be readonly?
export type BaseAuthFormFields = {
  email: string;
  password: string;
};

export type LoginFormFields = BaseAuthFormFields;
// TODO: why is this not readonly?
export type SignupFormFields = BaseAuthFormFields & {
  username: string;
};

export type SignupFormFieldNames = keyof SignupFormFields;
export type LoginFormFieldNames = keyof LoginFormFields;
