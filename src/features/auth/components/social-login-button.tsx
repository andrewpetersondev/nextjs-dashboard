import type React from "react";
import { memo } from "react";
import { GitHubIcon, GoogleIcon } from "@/features/auth/components/icons";
import { SOCIAL_ANCHOR_BUTTON_CLASSES } from "@/ui/button-classes";

/**
 * Supported social login providers.
 */
type Provider = "Google" | "GitHub";

/**
 * Props for SocialLoginButton.
 */
interface SocialLoginButtonProps {
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

/**
 * Renders a social login button for OAuth providers.
 * @param props SocialLoginButtonProps
 */
export const SocialLoginButton: React.NamedExoticComponent<SocialLoginButtonProps> =
  memo(function SocialLoginButton({ provider, href, mode = "login", dataCy }) {
    return (
      <a
        aria-label={`${mode === "signup" ? "Sign up" : "Sign in"} with ${provider}`}
        className={SOCIAL_ANCHOR_BUTTON_CLASSES}
        data-cy={dataCy}
        href={href}
        rel="noopener noreferrer"
      >
        {providerIcons[provider]}
        <span>{provider}</span>
      </a>
    );
  });
