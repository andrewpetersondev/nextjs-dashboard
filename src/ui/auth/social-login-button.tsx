import { GitHubIcon, GoogleIcon } from "@/src/ui/auth/icons";
import type React from "react";
import { memo } from "react";

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
	"data-cy"?: string;
}

const providerIcons: Record<Provider, React.ReactNode> = {
	Google: <GoogleIcon />,
	GitHub: <GitHubIcon />,
};

const buttonClasses =
	"bg-bg-primary text-text-primary ring-bg-accent hover:bg-bg-accent focus-visible:ring-bg-focus flex w-full items-center justify-center gap-3 rounded-md px-3 py-2 text-sm font-semibold ring-1 focus-visible:ring-2";

/**
 * Renders a social login button for OAuth providers.
 * @param props SocialLoginButtonProps
 */
export const SocialLoginButton: React.NamedExoticComponent<SocialLoginButtonProps> =
	memo(function SocialLoginButton({
		provider,
		href,
		mode = "login",
		"data-cy": dataCy,
	}) {
		return (
			<a
				href={href}
				className={buttonClasses}
				data-cy={dataCy}
				aria-label={`${mode === "signup" ? "Sign up" : "Sign in"} with ${provider}`}
				rel="noopener noreferrer"
			>
				{providerIcons[provider]}
				<span>{provider}</span>
			</a>
		);
	});
