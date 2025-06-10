import Link from "next/link";
import type { JSX } from "react";

type AuthSwitchLinkProps = {
	prompt: string;
	href: string;
	linkText: string;
};

export default function AuthSwitchLink({
	prompt,
	href,
	linkText,
}: AuthSwitchLinkProps): JSX.Element {
	return (
		<p className="text-text-accent mt-10 text-center text-sm/6">
			{prompt}{" "}
			<Link
				href={href}
				className="text-text-secondary hover:text-text-hover font-semibold"
			>
				{linkText}
			</Link>
		</p>
	);
}
