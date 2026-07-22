import type { ForgotPasswordField } from "@/modules/auth/presentation/authn/transports/forgot-password.transport";
import type { LoginField } from "@/modules/auth/presentation/authn/transports/login.transport";
import type { SignupField } from "@/modules/auth/presentation/authn/transports/signup.transport";
import type { FormAction } from "@/shared/forms/core/types/form-action.dto";

/**
 * Shared properties for UI components that require an authentication-related form action.
 *
 * @template T - The type of form fields, either {@link LoginField} or {@link SignupField}.
 */
export interface AuthActionProps<T extends LoginField | SignupField> {
	/**
	 * The server action to be executed upon form submission.
	 */
	action: FormAction<T, never>;
}

/**
 * Properties for the forgot-password form/card.
 *
 * Separate from {@link AuthActionProps}: the request-reset action returns a
 * success payload (`null` data + generic confirmation) instead of redirecting,
 * so its result type is `null`, not `never`.
 */
export interface ForgotPasswordActionProps {
	/**
	 * The server action to be executed upon form submission.
	 */
	action: FormAction<ForgotPasswordField, null>;
}
