import {
	ArrowRightIcon,
	ArrowTopRightOnSquareIcon,
	GlobeAltIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import type { JSX } from "react";
import { demoUserAction } from "@/modules/auth/presentation/authn/actions/demo-user.action";
import { DemoForm } from "@/modules/auth/presentation/authn/components/forms/demo-form";
import { GITHUB_REPO_URL } from "@/shared/routing/external-urls";
import { ROUTES } from "@/shared/routing/routes";
import { H1, H2, H3 } from "@/ui/atoms/headings.atom";
import { tektur } from "@/ui/styles/fonts";
import { cn } from "@/ui/utils/cn";

const ARCHITECTURE_DOCS_URL = `${GITHUB_REPO_URL}/tree/main/docs/diagrams`;

const FEATURE_MODULES = ["auth", "invoices", "customers", "users"] as const;

const MODULE_LAYERS = [
	{ detail: "server components & actions", name: "presentation" },
	{ detail: "use-cases & workflows", name: "application" },
	{ detail: "entities & policies", name: "domain" },
	{ detail: "Drizzle repositories", name: "infrastructure" },
] as const;

const PROOF_POINTS = [
	{
		body: "Unit and Cypress end-to-end suites — including axe accessibility checks — run in CI on every push to main.",
		title: "Tested in CI",
	},
	{
		body: "Strict TypeScript from server actions to the database layer, with environment validation at startup.",
		title: "Typed end to end",
	},
	{
		body: "Feature modules keep domain logic behind clear layers, with decisions captured as ADRs.",
		title: "Layered by design",
	},
	{
		body: "Docker Compose spins up the full stack in one command; the live demo runs on Vercel and Neon Postgres.",
		title: "Portable by default",
	},
] as const;

function LandingHeader(): JSX.Element {
	return (
		<header className="flex items-center justify-between gap-4 py-2">
			<Link
				className="flex items-center gap-2 text-text-primary"
				href={ROUTES.root}
			>
				<GlobeAltIcon aria-hidden={true} className="h-8 w-8 rotate-[15deg]" />
				<span className={cn(tektur.className, "font-bold text-2xl")}>Acme</span>
			</Link>
			<nav className="flex items-center gap-6">
				<a
					className="flex items-center gap-1 font-medium text-sm text-text-secondary transition-colors hover:text-text-hover"
					data-testid="github-repo-link"
					href={GITHUB_REPO_URL}
				>
					GitHub
					<ArrowTopRightOnSquareIcon aria-hidden={true} className="w-4" />
				</a>
				<Link
					className="flex items-center gap-1 font-medium text-sm text-text-primary transition-colors hover:text-text-hover"
					data-testid="login-button"
					href={ROUTES.auth.login}
				>
					Log in
					<ArrowRightIcon aria-hidden={true} className="w-4" />
				</Link>
			</nav>
		</header>
	);
}

function TryDemoCta(): JSX.Element {
	return (
		<div className="flex max-w-xs flex-col gap-3">
			{/* Fixed sky/near-black pair: the semantic active/hover tokens fall below
			    WCAG AA contrast in dark mode, so the CTA pins colors that pass in both schemes. */}
			<DemoForm
				action={demoUserAction}
				className="bg-sky-500 text-gray-950 hover:bg-sky-400 hover:text-gray-950"
				dataCy="demo-user-button-try-demo"
				label="Try the demo"
				size="lg"
				text="Try the demo"
				variant="secondary"
			/>
			<p className="text-sm text-text-secondary">
				One click creates a throwaway demo account and opens the dashboard.
				Nothing to sign up for.
			</p>
		</div>
	);
}

function HeroCopy(): JSX.Element {
	return (
		<div className="flex flex-col gap-6">
			<p className="font-medium text-sm text-text-accent uppercase tracking-widest">
				Portfolio project
			</p>
			<H1 className="text-4xl leading-tight md:text-5xl md:leading-tight">
				A small dashboard, engineered like a production app.
			</H1>
			<p className="max-w-prose text-lg text-text-secondary">
				Invoices, customers, and role-guarded user management — built end to end
				by Andrew Peterson, with strict TypeScript, layered feature modules, and
				a test suite that runs in CI on every push to main.
			</p>
			<TryDemoCta />
		</div>
	);
}

function ArchitectureCard(): JSX.Element {
	return (
		<div className="flex flex-col gap-4 rounded-xl bg-bg-secondary p-6 shadow-sm">
			<H2 className="font-medium text-base text-text-secondary md:text-base">
				Under the hood
			</H2>
			<p className="text-text-secondary text-xs uppercase tracking-widest">
				Feature modules
			</p>
			<ul className="grid grid-cols-2 gap-2">
				{FEATURE_MODULES.map((moduleName) => (
					<li
						className={cn(
							tektur.className,
							"rounded-md bg-bg-primary px-3 py-2 text-center text-sm text-text-primary",
						)}
						key={moduleName}
					>
						{moduleName}
					</li>
				))}
			</ul>
			<p className="text-text-secondary text-xs uppercase tracking-widest">
				Layering pattern
			</p>
			<ul className="flex flex-col gap-2">
				{MODULE_LAYERS.map((layer) => (
					<li
						className="flex flex-wrap items-baseline gap-x-3 rounded-md border-bg-active border-l-2 bg-bg-primary px-3 py-2"
						key={layer.name}
					>
						<span className={cn(tektur.className, "text-sm text-text-primary")}>
							{layer.name}
						</span>
						<span className="text-text-secondary text-xs">{layer.detail}</span>
					</li>
				))}
			</ul>
			<p
				className={cn(
					tektur.className,
					"rounded-md bg-bg-accent px-3 py-2 text-center text-sm text-text-primary",
				)}
			>
				PostgreSQL
			</p>
			<a
				className="flex items-center gap-1 self-start font-medium text-sm text-text-accent transition-colors hover:text-text-hover"
				href={ARCHITECTURE_DOCS_URL}
			>
				Explore the architecture docs
				<ArrowTopRightOnSquareIcon aria-hidden={true} className="w-4" />
			</a>
		</div>
	);
}

function ProofSection(): JSX.Element {
	return (
		<section className="flex flex-col gap-6">
			<H2 className="font-medium text-sm text-text-secondary uppercase tracking-widest md:text-sm">
				Engineering highlights
			</H2>
			<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{PROOF_POINTS.map((point) => (
					<li
						className="flex flex-col gap-2 rounded-xl bg-bg-secondary p-5"
						key={point.title}
					>
						<H3 className="text-base md:text-base">{point.title}</H3>
						<p className="text-sm text-text-secondary">{point.body}</p>
					</li>
				))}
			</ul>
		</section>
	);
}

function LandingFooter(): JSX.Element {
	return (
		<footer className="flex flex-wrap items-center justify-between gap-4 border-bg-secondary border-t py-6 text-text-secondary text-xs">
			<p>
				Built by Andrew Peterson ·{" "}
				<a
					className="underline transition-colors hover:text-text-hover"
					href={GITHUB_REPO_URL}
				>
					Source on GitHub
				</a>
			</p>
			<p>Next.js 16 · React 19 · TypeScript · PostgreSQL · Tailwind CSS 4</p>
		</footer>
	);
}

export default function Page(): JSX.Element {
	return (
		<div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-16 bg-[radial-gradient(60rem_30rem_at_80%_-10%,var(--color-bg-accent)_0%,transparent_60%)] px-6 py-6 md:px-10">
			<LandingHeader />
			<main className="flex flex-1 flex-col gap-16">
				<section className="grid items-center gap-12 md:grid-cols-[1.1fr_0.9fr]">
					<HeroCopy />
					<ArchitectureCard />
				</section>
				<ProofSection />
			</main>
			<LandingFooter />
		</div>
	);
}
