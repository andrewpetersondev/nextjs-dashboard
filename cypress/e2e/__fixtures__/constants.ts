export const dividerOrModulus = 99999999;

export const STATUS_CODES = {
  BAD_REQUEST: 400,
  CONFLICT: 409,
  CREATED: 201,
  FORBIDDEN: 403,
  INTERNAL_SERVER_ERROR: 500,
  NO_CONTENT: 204,
  NOT_FOUND: 404,
  OK: 200,
  UNAUTHORIZED: 401,
};

export const DURATION = {
  DEFAULT: 10000,
  FIVE_SECONDS: 5000,
  TEN_SECONDS: 10000,
};

export const SUCCESS_MESSAGES = {
  USER_SUSPENDED: /User suspended successfully/i,
};

export const UI_MATCHERS = {
  DASHBOARD_H1: /User Dashboard/i,
  LOGIN_HEADING: /Login to your account/i,
  SIGN_OUT_BUTTON: /Sign Out/i,
  SIGNUP_HEADING: /Sign up for an account/i,
  WELCOME_HOME: /Welcome to Acme\./i,
};

export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: /Invalid credentials/i,
  INVALID_FILE_TYPE: /Invalid file type/i,
  ITEM_ALREADY_EXISTS: /Item already exists/i,
  RATE_LIMIT_EXCEEDED: /Rate limit exceeded/i,
};
