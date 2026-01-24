"use client";
import { type JSX, useId } from "react";

/**
 * RememberMeCheckbox component for persisting user session.
 *
 * @returns {JSX.Element} Rendered RememberMeCheckbox component.
 */
export function RememberMeCheckbox(): JSX.Element {
  const id = useId();
  return (
    <div className="flex gap-3">
      <div className="flex h-6 shrink-0 items-center">
        <div className="group grid size-4 grid-cols-1">
          <input
            className="col-start-1 row-start-1 h-4 w-4 rounded border-bg-accent bg-bg-accent text-bg-active focus:ring-bg-focus"
            id={id}
            name="remember-me"
            type="checkbox"
          />
          <svg
            className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white opacity-0 group-has-[:checked]:opacity-100"
            fill="none"
            viewBox="0 0 14 14"
          >
            <title>Checkmark</title>
            <path
              d="M3 8L6 11L11 3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </div>
      </div>
      <label className="block text-sm/6 text-text-primary" htmlFor={id}>
        Remember me
      </label>
    </div>
  );
}
