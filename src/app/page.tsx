import AcmeLogo from "@/src/ui/acme-logo";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import type { JSX } from "react";

export default function Page(): JSX.Element {
	return (
		<main className="flex min-h-screen flex-col p-6">
			<AcmeLogo />
			<div className="mt-4 flex grow flex-col gap-4 md:flex-row">
				<div className="bg-bg-secondary flex flex-col justify-center gap-6 rounded-lg px-6 py-10 md:w-2/5 md:px-20">
					<p className="text-xl font-medium md:text-3xl md:leading-normal">
						<strong>Welcome to Acme.</strong> This is the example for the{" "}
						<a
							href="https://nextjs.org/learn/"
							className="text-text-active hover:text-text-hover underline font-extrabold  font-experiment"
							data-testid="nextjs-course-link"
						>
							Next.js Learn Course
						</a>
						, brought to you by Vercel.
					</p>
					<Link
						href="/login"
						className="bg-bg-active text-text-active hover:bg-bg-hover focus-visible:outline-bg-focus flex items-center gap-5 self-start rounded-md px-6 py-3 text-sm font-semibold shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 md:text-base"
						data-testid="login-button"
					>
						<span>Log in</span> <ArrowRightIcon className="w-5 md:w-6" />
					</Link>
				</div>
				<div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
					<Image
						src="/hero-desktop.png"
						width={1000}
						height={760}
						alt="Screenshots of the dashboard project showing desktop version"
						className="hidden md:block"
						priority={true}
					/>
					<Image
						src="/hero-mobile.png"
						width={560}
						height={620}
						alt="Screenshot of the dashboard project showing mobile version"
						className="block md:hidden"
						priority={true}
					/>
				</div>
			</div>
		</main>
	);
}
