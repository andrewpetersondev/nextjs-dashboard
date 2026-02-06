import type { LoginCommand } from "@/modules/auth/application/auth-user/dtos/requests/login.command";
import type { LoginRequestDto } from "@/modules/auth/presentation/authn/transports/login.form.schema";

/**
 * Adapts validated login form data to an application-level login command.
 *
 * @param input - The validated login form data.
 * @returns The login command.
 */
export function toLoginCommand(input: LoginRequestDto): LoginCommand {
  return {
    email: input.email,
    password: input.password,
  };
}
