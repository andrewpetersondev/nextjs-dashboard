// Base Form Fields
export type BaseAuthFormFields = {
  readonly email: string;
  readonly password: string;
};

// Form Fields
export type LoginFormFields = BaseAuthFormFields;
export type SignupFormFields = BaseAuthFormFields & {
  readonly username: string;
};

// Form Field Names
export type SignupFormFieldNames = keyof SignupFormFields;
export type LoginFormFieldNames = keyof LoginFormFields;
