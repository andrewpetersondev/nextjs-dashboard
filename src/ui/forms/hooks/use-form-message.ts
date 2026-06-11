import { useEffect, useState } from "react";
import type { FormState } from "@/shared/forms/core/types/form-result.dto";
import { ALERT_AUTO_HIDE_MS } from "@/shared/time/time.constants";

/**
 * Controls auto-hide visibility for form submission messages.
 * Idle (`state === null`) has no message, so the alert stays hidden.
 */
export function useFormMessage<T>(state: FormState<T>): boolean {
	const [showAlert, setShowAlert] = useState(false);

	let message: string | undefined;
	if (state !== null) {
		message = state.ok ? state.value.message : state.error.message;
	}

	useEffect((): (() => void) | undefined => {
		if (!message) {
			setShowAlert(false);
			return;
		}

		setShowAlert(true);

		const timer: ReturnType<typeof setTimeout> = setTimeout(() => {
			setShowAlert(false);
		}, ALERT_AUTO_HIDE_MS);

		return () => clearTimeout(timer);
	}, [message]);

	return showAlert;
}
