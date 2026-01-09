import "server-only";

/**
 * Input DTO for the Login Use Case.
 * Represents the full set of credentials provided by the user.
 */
export interface LoginRequestDto {
  readonly email: string;
  readonly password: string;
}
