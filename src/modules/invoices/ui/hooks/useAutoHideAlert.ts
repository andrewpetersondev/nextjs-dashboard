"use client";

import { useEffect, useState } from "react";
import { ALERT_AUTO_HIDE_MS } from "@/ui/styles/timings.tokens";

export function useAutoHideAlert(message: string): boolean {
  const [showAlert, setShowAlert] = useState(false);

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
