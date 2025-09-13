// Auth Form Fields
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MIN_LENGTH_ERROR =
  "Username must be at least 3 characters long.";

export const USERNAME_MAX_LENGTH = 20;
export const USERNAME_MAX_LENGTH_ERROR =
  "Username must be at most 20 characters long.";

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

export const EMAIL_ERROR = "Email had some sort of error. Please try again.";

export const LOGIN_PATH = "/auth/login";

// API Endpoints
export const AUTH_REFRESH_ENDPOINT = "/api/auth/refresh" as const;
