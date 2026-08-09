"use client";

import { useEffect, useState } from "react";
import { ALERT_AUTO_HIDE_MS } from "@/shared/time/time.constants";

/**
 * Shows an alert for `ALERT_AUTO_HIDE_MS`, then hides it.
 *
 * Re-arms on each *change* to `message`, so the same string twice in a row will
 * not show again — pass a distinct value when a repeat must re-trigger.
 *
 * @returns Whether the alert should currently render; `false` for an empty
 * message, with no timer started.
 */
export function useAutoHideAlert(message: string): boolean {
	const [showAlert, setShowAlert] = useState(false);

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
