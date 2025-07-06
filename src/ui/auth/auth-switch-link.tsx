import Link from "next/link";
import type { JSX } from "react";

type AuthSwitchLinkProps = {
	prompt: string;
	href: string;
	linkText: string;
};

/**
 * AuthSwitchLink component for switching between authentication routes.
 *
 * @param {Object} props - Component props.
 * @param {string} props.prompt - Prompt text shown before the link.
 * @param {string} props.href - The href for the switch link.
 * @param {string} props.linkText - The text for the link.
 * @returns {JSX.Element} Rendered AuthSwitchLink component.
 */
export function AuthSwitchLink({
	prompt,
	href,
	linkText,
}: AuthSwitchLinkProps): JSX.Element {
	return (
		<p className="text-text-accent mt-10 text-center text-sm/6">
			{prompt}{" "}
			<Link
				className="text-text-secondary hover:text-text-hover font-semibold"
				href={href}
			>
				{linkText}
			</Link>
		</p>
	);
}
