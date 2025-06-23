// cypress/support/constants.ts

// --- Selector Constants ---
export const SIGNUP_USERNAME_INPUT = '[data-cy="signup-username-input"]';
export const SIGNUP_EMAIL_INPUT = '[data-cy="signup-email-input"]';
export const SIGNUP_PASSWORD_INPUT = '[data-cy="signup-password-input"]';
export const SIGNUP_SUBMIT_BUTTON = '[data-cy="signup-submit-button"]';
export const LOGIN_EMAIL_INPUT = '[data-cy="login-email-input"]';
export const LOGIN_PASSWORD_INPUT = '[data-cy="login-password-input"]';
export const LOGIN_SUBMIT_BUTTON = '[data-cy="login-submit-button"]';

// --- Error Constants ---
export const ERROR_DB = "DB_ERROR";
export const ERROR_USER_NOT_FOUND = "USER_NOT_FOUND";
export const ERROR_USER_CREATION_FAILED = "USER_CREATION_FAILED";
export const ERROR_USER_DELETION_FAILED = "USER_DELETION_FAILED";
export const ERROR_USER_UPDATE_FAILED = "USER_UPDATE_FAILED";
