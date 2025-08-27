"use client";

import { type RefObject, useEffect } from "react";

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  onOutside: (ev: MouseEvent | TouchEvent) => void,
) {
  useEffect(() => {
    function handler(ev: MouseEvent | TouchEvent) {
      const el = ref.current;
      if (!el || el.contains(ev.target as Node)) return;
      onOutside(ev);
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [ref, onOutside]);
}
