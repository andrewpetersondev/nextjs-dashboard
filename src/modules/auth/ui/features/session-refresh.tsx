"use client";

import { useEffect, useRef } from "react";
import type { UpdateSessionOutcome } from "@/modules/auth/shared/domain/session/session.policy";
import { AUTH_REFRESH_ENDPOINT } from "@/modules/auth/ui/auth-ui.constants";
import { getPublicNodeEnv } from "@/shared/config/env-public";
import {
  CONTENT_TYPE_JSON,
  HEADER_CONTENT_TYPE,
  HTTP_STATUS_NO_CONTENT,
} from "@/shared/http/http-headers";
import { logger } from "@/shared/logging/infrastructure/logging.client";

const REFRESH_INTERVAL_MS = 60_000;
const KICKOFF_TIMEOUT_MS = 1500;
const REFRESH_JITTER_MS = 1000;

/**
 * Checks if the session needs a refresh and performs the request.
 * @returns Promise that resolves when the check is complete.
 */
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
      const outcome = (await res.json()) as UpdateSessionOutcome;
      // Log based on environment
      const env = getPublicNodeEnv();
      if (env === "development") {
        logger.debug("[session-refresh] outcome:", outcome);
      } else {
        logger.error("[session-refresh] outcome:", outcome);
      }
    }
  } catch {
    // Ignore transient network errors
  }
}

function useSessionRefresh(): void {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const kickoffRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);

  useEffect(() => {
    let aborted = false;

    const ping = async (): Promise<void> => {
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

    const onFocus = (): void => {
      if (!(document.hidden || inFlightRef.current)) {
        ping();
      }
    };
    const onVisibility = (): void => {
      if (!(document.hidden || inFlightRef.current)) {
        ping();
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      aborted = true;
      if (kickoffRef.current) {
        clearTimeout(kickoffRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
}

export function SessionRefresh(): null {
  useSessionRefresh();
  return null;
}
