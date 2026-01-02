export abstract class AuthError extends Error {
  abstract readonly code: string;
}

export class InvalidCredentialsError extends AuthError {
  readonly code = "AUTH_INVALID_CREDENTIALS";
  constructor() {
    super("Invalid email or password");
  }
}

export class WeakPasswordError extends AuthError {
  readonly code = "AUTH_WEAK_PASSWORD";
  readonly reason: string;

  constructor(reason: string) {
    super(`Password is too weak: ${reason}`);
    this.reason = reason;
  }
}

export class EmailAlreadyExistsError extends AuthError {
  readonly code = "AUTH_EMAIL_EXISTS";
  readonly email: string;

  constructor(email: string) {
    super(`Email already registered: ${email}`);
    this.email = email;
  }
}

export class SessionExpiredError extends AuthError {
  readonly code = "AUTH_SESSION_EXPIRED";
  constructor() {
    super("Session has expired");
  }
}
