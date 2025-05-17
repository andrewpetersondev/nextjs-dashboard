import Image from 'next/image';

export default function Heading({ text }: { text: string; }) {
	return (
		<>
			{/* Logo and heading */}
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<Image
					alt="Your Company"
					src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
					className="mx-auto h-10 w-auto"
					width={40}
					height={40}
					priority
				/>
				<h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight">
					{text}
				</h2>
			</div>
		</>
	);
}
