"use client";
import { useEffect, useRef } from "react";
import { AUTH_REFRESH_ENDPOINT } from "@/modules/auth/domain/auth.constants";
import {
  SESSION_KICKOFF_TIMEOUT_MS,
  SESSION_REFRESH_JITTER_MS,
  SESSION_REFRESH_PING_MS,
} from "@/modules/auth/domain/sessions/session.constants";
import type { UpdateSessionResult } from "@/modules/auth/domain/sessions/session-payload.types";
import { getPublicNodeEnv } from "@/shared/config/env-public";
import {
  CONTENT_TYPE_JSON,
  HEADER_CONTENT_TYPE,
  HTTP_STATUS_NO_CONTENT,
} from "@/shared/http/http-headers";
import { logger } from "@/shared/logging/infrastructure/logging.client";

// Base cadence to check for refresh opportunities (20 seconds).
const INTERVAL_MS = SESSION_REFRESH_PING_MS;
// Small startup delay to avoid racing the initial page load.
const kickoffTimeout = SESSION_KICKOFF_TIMEOUT_MS;
// Add a small random jitter so multiple tabs don’t sync up perfectly.
const JITTER_MS = SESSION_REFRESH_JITTER_MS;

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <ignore for now>
function useSessionRefresh(): void {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const kickoffRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);

  // biome-ignore lint/complexity/noExcessiveLinesPerFunction: <ignore for now>
  useEffect(() => {
    let aborted = false;

    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <ignore for now>
    const ping = async (): Promise<void> => {
      if (aborted || inFlightRef.current) {
        return;
      }
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

      inFlightRef.current = true;
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
          const outcome = (await res.json()) as UpdateSessionResult;
          switch (getPublicNodeEnv()) {
            case "production":
              logger.error("[session-refresh] outcome:", outcome);
              break;
            case "development":
              logger.debug("[session-refresh] outcome:", outcome);
              break;
            case "test":
              logger.error("[session-refresh] outcome:", outcome);
              break;
            default:
              logger.error("[session-refresh] outcome:", outcome);
          }
        }
      } catch {
        // Ignore transient network errors
      } finally {
        inFlightRef.current = false;
      }
    };

    // Kickoff once after a short delay with jitter.
    kickoffRef.current = setTimeout(
      () => {
        ping();
      },
      kickoffTimeout + Math.floor(Math.random() * JITTER_MS),
    );

    // Periodic checks; ping also runs on focus/visibilitychange.
    intervalRef.current = setInterval(
      () => {
        ping();
      },
      INTERVAL_MS + Math.floor(Math.random() * JITTER_MS),
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
