"use client";

import { useCallback, useState } from "react";

export function useDisclosure(
  initial = false,
  onChange?: (open: boolean) => void,
) {
  const [open, setOpen] = useState(initial);
  const set = useCallback(
    (v: boolean) => {
      setOpen(v);
      onChange?.(v);
    },
    [onChange],
  );
  const openFn = useCallback(() => set(true), [set]);
  const closeFn = useCallback(() => set(false), [set]);
  const toggle = useCallback(() => set(!open), [open, set]);
  return { closeFn, open, openFn, set, toggle };
}
