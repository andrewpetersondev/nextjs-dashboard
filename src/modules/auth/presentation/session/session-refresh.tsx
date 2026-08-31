"use client";
import { useEffect, useRef } from "react";
import type { UpdateSessionOutcomeDto } from "@/modules/auth/application/session/dtos/responses/update-session-outcome.dto";
import { AUTH_REFRESH_ENDPOINT } from "@/modules/auth/presentation/constants/auth-ui.constants";
import { getPublicNodeEnv } from "@/shared/core/config/public/env-public";
import {
	CONTENT_TYPE_JSON,
	HEADER_CONTENT_TYPE,
	HTTP_STATUS_NO_CONTENT,
} from "@/shared/http/core/http-headers";
import { ROUTES } from "@/shared/routing/routes";
import { logger } from "@/shared/telemetry/logging/infrastructure/logging.client";

const REFRESH_INTERVAL_MS = 60_000;
const KICKOFF_TIMEOUT_MS = 1500;
const REFRESH_JITTER_MS = 5000;
const REFRESH_LOCK_KEY = "auth:session-refresh:last-at";
const REFRESH_LOCK_THRESHOLD_MS = 10_000;

/**
 * Checks if the session needs a refresh and performs the request.
 * @returns Promise that resolves when the check is complete.
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: ignore for now
async function performSessionPing(): Promise<void> {
	if (document.hidden) {
		return;
	}
	if (
		typeof navigator !== "undefined" &&
		"onLine" in navigator &&
		!navigator.onLine
	) {
		return;
	}

	// Simple multi-tab lock to avoid race conditions during rotation
	const now = Date.now();
	const lastRefresh = Number(localStorage.getItem(REFRESH_LOCK_KEY) || 0);
	if (now - lastRefresh < REFRESH_LOCK_THRESHOLD_MS) {
		return;
	}
	localStorage.setItem(REFRESH_LOCK_KEY, String(now));

	try {
		const res = await fetch(AUTH_REFRESH_ENDPOINT, {
			cache: "no-store",
			credentials: "include",
			method: "POST",
		});

		// Backward-compat: older servers may still send 204.
		if (res.status === HTTP_STATUS_NO_CONTENT) {
			return;
		}

		const ct = res.headers.get(HEADER_CONTENT_TYPE) ?? "";
		if (res.ok && ct.includes(CONTENT_TYPE_JSON)) {
			const outcome = (await res.json()) as UpdateSessionOutcomeDto;

			// Handle absolute lifetime exceeded - redirect to force re-authentication
			if (
				!outcome.refreshed &&
				outcome.reason === "absolute_lifetime_exceeded"
			) {
				window.location.href = ROUTES.auth.login;
				return;
			}

			// Log based on environment
			const env = getPublicNodeEnv();
			if (env === "development") {
				logger.debug("[session-refresh] outcome:", outcome);
			} else if (!outcome.refreshed && outcome.reason !== "not_needed") {
				// Only log at info level for interesting non-refresh outcomes (e.g. lifetime exceeded)
				logger.info("[session-refresh] info:", outcome);
			}
		}
	} catch {
		// Ignore transient network errors
	}
}

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: close enough
function useSessionRefresh(): void {
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const kickoffRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const inFlightRef = useRef(false);

	useEffect(() => {
		let aborted = false;

		const runPing = async (): Promise<void> => {
			if (aborted || inFlightRef.current) {
				return;
			}

			inFlightRef.current = true;
			try {
				await performSessionPing();
			} finally {
				if (!aborted) {
					inFlightRef.current = false;
				}
			}
		};

		// Timers and listeners take sync callbacks, so the rejection is handled here once
		// rather than discarded at each call site: performSessionPing's localStorage access
		// sits outside its own try/catch and throws when the browser blocks site data.
		const ping = (): void => {
			runPing().catch(() => {
				// Transient failure; the next interval tick retries.
			});
		};

		// Kickoff once after a short delay with jitter.
		kickoffRef.current = setTimeout(
			() => {
				ping();
			},
			KICKOFF_TIMEOUT_MS + Math.floor(Math.random() * REFRESH_JITTER_MS),
		);

		// Periodic checks; ping also runs on focus/visibilitychange.
		intervalRef.current = setInterval(
			() => {
				ping();
			},
			REFRESH_INTERVAL_MS + Math.floor(Math.random() * REFRESH_JITTER_MS),
		);

		// Both events mean "the tab is usable again", so they share one handler.
		const onWake = (): void => {
			if (!(document.hidden || inFlightRef.current)) {
				ping();
			}
		};

		window.addEventListener("focus", onWake);
		document.addEventListener("visibilitychange", onWake);

		return () => {
			aborted = true;
			if (kickoffRef.current) {
				clearTimeout(kickoffRef.current);
			}
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
			window.removeEventListener("focus", onWake);
			document.removeEventListener("visibilitychange", onWake);
		};
	}, []);
}

export function SessionRefresh(): null {
	useSessionRefresh();
	return null;
}
