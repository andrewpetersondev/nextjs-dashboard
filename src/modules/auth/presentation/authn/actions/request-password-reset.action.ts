"use server";
import { makeAuthComposition } from "@/modules/auth/infrastructure/composition/auth.composition";
import {
	FORGOT_PASSWORD_ECHO_FIELDS_LIST,
	FORGOT_PASSWORD_FIELDS_LIST,
	ForgotPasswordFormSchema,
} from "@/modules/auth/presentation/authn/transports/forgot-password.form.schema";
import { FORGOT_PASSWORD_CONFIRMATION } from "@/modules/auth/presentation/constants/auth.tokens";
import type {
	FormResult,
	FormState,
} from "@/shared/forms/core/form-result.dto";
import { makeFormOk } from "@/shared/forms/logic/form-result.factory";
import { validateForm } from "@/shared/forms/server/validate-form";
import { PerformanceTracker } from "@/shared/telemetry/core/performance-tracker";

/**
 * Next.js Server Action for requesting a password reset.
 *
 * @remarks
 * ADR 006 (prevent credential enumeration): after validation this action
 * deliberately performs **no user lookup and no branching on account
 * existence** — every syntactically valid email receives the same response
 * from the same code path, so the endpoint cannot be used to probe which
 * accounts exist. The response is indistinguishable by construction, not by
 * error mapping.
 *
 * No reset email is sent (demo scope); the confirmation copy stays honest
 * about that in the UI via the demo note.
 *
 * @param _prevState - The previous form state (unused but required by `useActionState`).
 * @param formData - The form data containing the email address.
 * @returns A promise resolving to a {@link FormResult}: field errors on
 * invalid input, otherwise the generic confirmation.
 */
export async function requestPasswordResetAction(
	_prevState: FormState<null>,
	formData: FormData,
): Promise<FormResult<null>> {
	const auth = await makeAuthComposition();
	const { ip } = auth.request;

	const tracker = new PerformanceTracker();

	const logger = auth.loggers.action;

	logger.operation("info", "Password reset request started", {
		operationContext: "authentication",
		operationIdentifiers: { ip },
		operationName: "passwordResetRequest.start",
	});

	const validated = await tracker.measure("validation", () =>
		validateForm(
			formData,
			ForgotPasswordFormSchema,
			FORGOT_PASSWORD_FIELDS_LIST,
			{
				echoFields: FORGOT_PASSWORD_ECHO_FIELDS_LIST,
			},
		),
	);

	if (!validated.ok) {
		logger.operation("warn", "Password reset request validation failed", {
			duration: tracker.getTotalDuration(),
			operationContext: "validation",
			operationIdentifiers: { ip },
			operationName: "passwordResetRequest.validation.failed",
		});

		return validated;
	}

	logger.operation("info", "Password reset request acknowledged", {
		duration: tracker.getTotalDuration(),
		operationContext: "authentication",
		operationIdentifiers: { email: validated.value.data.email, ip },
		operationName: "passwordResetRequest.acknowledged",
	});

	return makeFormOk(null, FORGOT_PASSWORD_CONFIRMATION);
}
