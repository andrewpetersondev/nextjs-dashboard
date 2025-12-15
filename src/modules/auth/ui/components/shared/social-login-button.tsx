import { type FC, type JSX, memo, type ReactNode } from "react";
import type { OauthProvider } from "@/modules/auth/shared/ui/auth-ui.constants";
import {
  GitHubIcon,
  GoogleIcon,
} from "@/modules/auth/ui/components/shared/icons";

const SOCIAL_BUTTON_CLASSES =
  "flex w-full items-center justify-center gap-3 rounded-md bg-bg-primary px-3 py-2 text-sm font-semibold text-text-primary ring-1 ring-bg-accent hover:bg-bg-accent focus-visible:ring-2 focus-visible:ring-bg-focus";

interface SocialLoginButtonProps {
  /** Cypress test id */
  dataCy?: string;
  /** OAuth endpoint or login URL */
  href: string;
  /** Mode for ARIA label */
  mode?: "signup" | "login";
  /** Social provider name */
  provider: OauthProvider;
}

const providerIcons: Record<OauthProvider, ReactNode> = {
  github: <GitHubIcon />,
  google: <GoogleIcon />,
};

/**
 * Renders a social login button for OAuth providers.
 */
export const SocialLoginButton: FC<SocialLoginButtonProps> = memo(
  function SocialLoginButtonInner({
    provider,
    href,
    mode = "login",
    dataCy,
  }: SocialLoginButtonProps): JSX.Element {
    return (
      <a
        aria-label={`${mode === "signup" ? "Sign up" : "Sign in"} with ${provider}`}
        className={SOCIAL_BUTTON_CLASSES}
        data-cy={dataCy}
        href={href}
        rel="noopener noreferrer"
      >
        {providerIcons[provider]}
        <span>{provider}</span>
      </a>
    );
  },
);
