import type { FC } from "react";

interface SignupFormErrorMessageProps {
  message?: string;
}

/**
 * Displays signup form error messages.
 */
export const AuthServerMessage: FC<SignupFormErrorMessageProps> = ({
  message,
}: SignupFormErrorMessageProps) => (
  <div
    aria-atomic="true"
    aria-live="polite"
    className="flex h-8 items-end space-x-1"
  >
    {message && (
      <p className="text-text-error" data-cy="signup-message-errors">
        {message}
      </p>
    )}
  </div>
);
