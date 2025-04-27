import AcmeLogo from "@/src/ui/acme-logo";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";
import ClientComponent from "@/src/ui/client-component";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <ClientComponent />
      <AcmeLogo />
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-bg-accent px-6 py-10 md:w-2/5 md:px-20">
          <p className="font-bold text-xl md:text-3xl md:leading-normal">
            <strong className="text-readme-accent font-bold">
              Welcome to Acme.
            </strong>{" "}
            This is the example for the{" "}
            <a
              href="https://nextjs.org/learn/"
              className="underline"
              data-testid="nextjs-course-link"
            >
              Next.js Learn Course
            </a>
            , brought to you by Vercel.
          </p>
          <Link
            href="/login"
            className="flex items-center gap-5 self-start rounded-lg bg-bg-active px-6 py-3 text-sm font-medium transition-colors hover:bg-bg-hover md:text-base"
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
          />
          <Image
            src="/hero-mobile.png"
            width={560}
            height={620}
            alt="Screenshot of the dashboard project showing mobile version"
            className="block md:hidden"
          />
        </div>
      </div>
    </main>
  );
}
