import { useEffect, useState } from "react";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { ALERT_AUTO_HIDE_MS } from "@/shared/tokens/timings.tokens";

/**
 * Hook to manage the visibility of a form message (success or error).
 * Automatically hides the message after a predefined duration.
 *
 * @param state - The current form result state.
 * @returns Boolean indicating whether the message alert should be shown.
 */
export function useFormMessage<T>(state: FormResult<T>): boolean {
  const [showAlert, setShowAlert] = useState(false);
  const message = state.ok ? state.value.message : state.error.message;

  useEffect(() => {
    if (!message) {
      setShowAlert(false);
      return;
    }
    setShowAlert(true);
    const timer = setTimeout(() => setShowAlert(false), ALERT_AUTO_HIDE_MS);

    return () => clearTimeout(timer);
  }, [message]);

  return showAlert;
}
