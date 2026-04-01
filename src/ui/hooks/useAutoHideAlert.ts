"use client";

import { useEffect, useState } from "react";
import { ALERT_AUTO_HIDE_MS } from "@/shared/time/time.constants";

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
