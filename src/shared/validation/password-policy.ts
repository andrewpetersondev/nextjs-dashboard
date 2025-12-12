export const PASSWORD_MIN_LENGTH = 5;
export const PASSWORD_MIN_LENGTH_ERROR =
  "Password must be at least 5 characters long.";

export const PASSWORD_MAX_LENGTH = 20;
export const PASSWORD_MAX_LENGTH_ERROR =
  "Password must be at most 20 characters long.";

export const PASSWORD_RULE_REGEX_CONTAIN_LETTER = /[a-zA-Z]/;
export const PASSWORD_RULE_REGEX_ERROR_LETTER =
  "Password must contain at least one letter.";

export const PASSWORD_RULE_REGEX_CONTAIN_NUMBER = /[0-9]/;
export const PASSWORD_RULE_REGEX_ERROR_NUMBER =
  "Password must contain at least one number.";

export const PASSWORD_RULE_REGEX_CONTAIN_SPECIAL_CHARACTER =
  /[!@#$%^&*(),.?":{}|<>]/;
export const PASSWORD_RULE_REGEX_ERROR_SPECIAL_CHARACTER =
  "Password must contain at least one special character.";
