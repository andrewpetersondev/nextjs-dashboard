import { memo, type ReactNode } from "react";

export const SocialLoginButton = memo(function SocialLoginButton({
	icon,
	children,
	href,
	"data-cy": dataCy,
}: {
	icon: ReactNode;
	children: ReactNode;
	href: string;
	"data-cy"?: string;
}) {
	return (
		<a
			href={href}
			className="bg-bg-primary text-text-primary ring-bg-accent hover:bg-bg-accent focus-visible:ring-bg-focus flex w-full items-center justify-center gap-3 rounded-md px-3 py-2 text-sm font-semibold ring-1 focus-visible:ring-2"
			data-cy={dataCy}
			aria-label={`Sign in with ${children}`}
		>
			{icon}
			<span>{children}</span>
		</a>
	);
});
