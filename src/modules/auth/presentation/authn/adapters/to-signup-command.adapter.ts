import type { SignupCommand } from "@/modules/auth/application/auth-user/dtos/requests/signup.command";
import type { SignupRequestDto } from "@/modules/auth/presentation/authn/transports/signup.form.schema";

/**
 * Adapts validated signup form data to an application-level signup command.
 *
 * @param input - The validated signup form data.
 * @returns The signup command.
 */
export function toSignupCommand(input: SignupRequestDto): SignupCommand {
  return {
    email: input.email,
    password: input.password,
    username: input.username,
  };
}
