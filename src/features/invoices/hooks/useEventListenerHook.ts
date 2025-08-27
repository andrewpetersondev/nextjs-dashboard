"use client";

import { useEffect, useRef } from "react";

export function useEventListener<
  K extends keyof WindowEventMap,
  T extends Window | Document | HTMLElement = Window,
>(
  target: T | null,
  type: K,
  listener: (ev: T extends Window ? WindowEventMap[K] : Event) => void,
  options?: boolean | AddEventListenerOptions,
) {
  const saved = useRef(listener);
  useEffect(() => {
    saved.current = listener;
  }, [listener]);

  useEffect(() => {
    if (!target) return;
    const el = target as unknown as EventTarget;
    // biome-ignore lint/suspicious/noExplicitAny: <functions is not used>
    const handler = (e: Event) => saved.current(e as any);
    el.addEventListener(type as string, handler, options);
    return () => el.removeEventListener(type as string, handler, options);
  }, [target, type, options]);
}
