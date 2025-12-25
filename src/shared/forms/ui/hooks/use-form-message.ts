import { useEffect, useState } from "react";
import type { FormResult } from "@/shared/forms/core/types/form-result.dto";
import { ALERT_AUTO_HIDE_MS } from "@/ui/styles/timings.tokens";

export function useFormMessage<T>(state: FormResult<T>) {
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
