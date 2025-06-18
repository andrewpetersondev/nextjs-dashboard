import Image from "next/image";
import type React from "react";
import type { JSX } from "react";

type HeadingProps = {
	text: string;
	logoSrc?: string;
	logoAlt?: string;
	children?: React.ReactNode;
};

export default function Heading({
	text,
	logoSrc = "https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600",
	logoAlt = "Your Company",
	children,
}: HeadingProps): JSX.Element {
	return (
		<div className="sm:mx-auto sm:w-full sm:max-w-md">
			<Image
				alt={logoAlt}
				className="mx-auto h-10 w-auto"
				height={40}
				priority={true}
				src={logoSrc}
				width={40}
			/>
			<h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight">
				{text}
			</h2>
			{children}
		</div>
	);
}
