import { ArrowRightIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import type { JSX } from "react";
import { ROUTES } from "@/shared/routes/routes";
import { AcmeLogo } from "@/ui/brand/acme-logo";

export default function Page(): JSX.Element {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <AcmeLogo />
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-bg-secondary px-6 py-10 md:w-2/5 md:px-20">
          <p className="font-medium text-xl md:text-3xl md:leading-normal">
            <strong>Welcome to Acme.</strong> This is the example for the{" "}
            <a
              className="font-experiment font-extrabold text-text-active underline hover:text-text-hover"
              data-testid="nextjs-course-link"
              href="https://nextjs.org/learn/"
            >
              Next.js Learn Course
            </a>
            , brought to you by Vercel.
          </p>
          <Link
            className="flex items-center gap-5 self-start rounded-md bg-bg-active px-6 py-3 font-semibold text-sm text-text-active shadow-sm transition-colors hover:bg-bg-hover focus-visible:outline-2 focus-visible:outline-bg-focus focus-visible:outline-offset-2 md:text-base"
            data-testid="login-button"
            href={ROUTES.AUTH.login}
          >
            <span className="font-experiment">Log in</span>{" "}
            <ArrowRightIcon className="w-5 md:w-6" />
          </Link>
        </div>
        <div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
          <Image
            alt="Screenshots of the dashboard project showing desktop version"
            className="hidden md:block"
            height={760}
            priority={true}
            src="/hero-desktop.png"
            width={1000}
          />
          <Image
            alt="Screenshot of the dashboard project showing mobile version"
            className="block md:hidden"
            height={620}
            priority={true}
            src="/hero-mobile.png"
            width={560}
          />
        </div>
      </div>
    </main>
  );
}
