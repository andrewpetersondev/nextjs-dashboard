import { memo } from "react";
import { GitHubIcon, GoogleIcon } from "./icons";

type Provider = "Google" | "GitHub";

type SocialLoginButtonProps = {
	provider: Provider;
	href: string;
	mode?: "signup" | "login";
	"data-cy"?: string;
};

const providerIcons: Record<Provider, React.ReactNode> = {
	Google: <GoogleIcon />,
	GitHub: <GitHubIcon />,
};

export const SocialLoginButton = memo(function SocialLoginButton({
	provider,
	href,
	mode = "login",
	"data-cy": dataCy,
}: SocialLoginButtonProps) {
	return (
		<a
			href={href}
			className="bg-bg-primary text-text-primary ring-bg-accent hover:bg-bg-accent focus-visible:ring-bg-focus flex w-full items-center justify-center gap-3 rounded-md px-3 py-2 text-sm font-semibold ring-1 focus-visible:ring-2"
			data-cy={dataCy}
			aria-label={`${mode === "signup" ? "Sign up" : "Sign in"} with ${provider}`}
		>
			{providerIcons[provider]}
			<span>{provider}</span>
		</a>
	);
});
