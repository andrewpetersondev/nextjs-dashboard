import Image from 'next/image';

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
}: HeadingProps) {
	return (
		<div className="sm:mx-auto sm:w-full sm:max-w-md">
			<Image
				alt={logoAlt}
				src={logoSrc}
				className="mx-auto h-10 w-auto"
				width={40}
				height={40}
				priority
			/>
			<h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight">
				{text}
			</h2>
			{children}
		</div>
	);
}
