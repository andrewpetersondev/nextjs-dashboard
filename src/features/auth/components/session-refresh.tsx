"use client";

import { useEffect, useRef } from "react";
import { FIVE_MINUTES_MS } from "@/shared/auth/sessions/constants";

const ENDPOINT = "/api/auth/refresh";
// Base cadence to check for refresh opportunities.
const INTERVAL_MS = FIVE_MINUTES_MS;
// Small startup delay to avoid racing the initial page load.
const kickoffTimeout = 1500;
// Add a small random jitter so multiple tabs don’t sync up perfectly.
const JITTER_MS = 1000;

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <explanation>
export function SessionRefresh(): null {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const kickoffRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);

  // biome-ignore lint/complexity/noExcessiveLinesPerFunction: <explanation>
  useEffect(() => {
    let aborted = false;

    const ping = async (): Promise<void> => {
      if (aborted || inFlightRef.current) {
        return;
      }
      if (document.hidden) {
        return;
      }
      if (
        typeof navigator !== "undefined" &&
        navigator &&
        "onLine" in navigator &&
        !navigator.onLine
      ) {
        return;
      }

      inFlightRef.current = true;
      try {
        await fetch(ENDPOINT, {
          cache: "no-store",
          credentials: "include",
          method: "POST",
        });
      } catch {
        // Ignore transient network errors
      } finally {
        inFlightRef.current = false;
      }
    };

    // Kickoff once after a short delay with jitter.
    kickoffRef.current = setTimeout(
      () => {
        void ping();
      },
      kickoffTimeout + Math.floor(Math.random() * JITTER_MS),
    );

    // Periodic checks; ping also runs on focus/visibilitychange.
    intervalRef.current = setInterval(
      () => {
        void ping();
      },
      INTERVAL_MS + Math.floor(Math.random() * JITTER_MS),
    );

    const onFocus = (): void => {
      // Only attempt on focus when page is visible and no request is active.
      if (!document.hidden && !inFlightRef.current) {
        void ping();
      }
    };
    const onVisibility = (): void => {
      if (!document.hidden && !inFlightRef.current) {
        void ping();
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

  return null;
}
