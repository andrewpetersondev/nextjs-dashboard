import type React from "react";
import { memo } from "react";
import { GitHubIcon, GoogleIcon } from "@/ui/auth/icons";

/**
 * Supported social login providers.
 */
export type Provider = "Google" | "GitHub";

/**
 * Props for SocialLoginButton.
 */
export interface SocialLoginButtonProps {
  /** Social provider name */
  provider: Provider;
  /** OAuth endpoint or login URL */
  href: string;
  /** Mode for ARIA label */
  mode?: "signup" | "login";
  /** Cypress test id */
  dataCy?: string;
}

const providerIcons: Record<Provider, React.ReactNode> = {
  GitHub: <GitHubIcon />,
  Google: <GoogleIcon />,
};

const buttonClasses =
  "bg-bg-primary text-text-primary ring-bg-accent hover:bg-bg-accent focus-visible:ring-bg-focus flex w-full items-center justify-center gap-3 rounded-md px-3 py-2 text-sm font-semibold ring-1 focus-visible:ring-2";

/**
 * Renders a social login button for OAuth providers.
 * @param props SocialLoginButtonProps
 */
export const SocialLoginButton: React.NamedExoticComponent<SocialLoginButtonProps> =
  memo(function SocialLoginButton({ provider, href, mode = "login", dataCy }) {
    return (
      <a
        aria-label={`${mode === "signup" ? "Sign up" : "Sign in"} with ${provider}`}
        className={buttonClasses}
        data-cy={dataCy}
        href={href}
        rel="noopener noreferrer"
      >
        {providerIcons[provider]}
        <span>{provider}</span>
      </a>
    );
  });
