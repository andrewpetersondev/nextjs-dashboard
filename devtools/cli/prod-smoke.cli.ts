import process from "node:process";
import { seedUserInputs } from "@devtools/seed/data/seed.users";
import { checkDeployFreshness } from "@devtools/shared/deploy-identity";
import {
	buildServerActionBody,
	extractForm,
} from "@devtools/shared/server-action-form";
import { SmokeReport } from "@devtools/shared/smoke-report";
import { PRODUCTION_SITE_URL } from "@/shared/routing/external-urls";
import { ROUTES } from "@/shared/routing/routes";
import { HERO_TAGLINE } from "@/ui/brand/brand.constants";

/**
 * Production watchdog (scheduled, NOT CI).
 *
 * Every other guard in this repo proves the CODE at merge time. This one is the
 * only thing that observes the DEPLOYED ARTIFACT afterwards, and the failures it
 * exists to catch happen WITHOUT a push, so no push-triggered check can see them:
 * Neon suspending the free-tier database, a rotated Vercel environment variable,
 * wiped seed data, a rollback leaving an older build serving, or an auth path
 * that breaks in production only (cookie flags, secret length, clock skew) while
 * every local and CI run stays green.
 *
 * It therefore asserts on a REAL LOGGED-IN SESSION, not just on 200s. A site that
 * returns 200 while login is broken is exactly what a read-only pinger misses.
 *
 * It also asserts IDENTITY, not just liveness — see `checkDeployFreshness`. A
 * failed build leaves the previous deployment serving, which passes every
 * liveness question correctly while running older code.
 *
 * HOW IT LOGS IN WITHOUT A BROWSER — see `@devtools/shared/server-action-form`.
 * Short version: React renders server-action forms for progressive enhancement,
 * so the action id is in the markup and a plain multipart POST dispatches it.
 * That means this exercises the same no-JS path a real visitor would take.
 *
 * CREDENTIALS ARE NOT SECRETS. This is a portfolio demo whose seeded logins are
 * published in README.md on purpose. They are imported from the seed data rather
 * than copied, so a changed seed password cannot leave this guard passing against
 * a login nobody can actually perform.
 *
 * COST. The seeded logins write NOTHING — login mints a stateless JWT. Only
 * `--demo` writes: the demo button inserts a `demo_user_counters` row and a real
 * user per click, permanently, and those users show up on the admin Users page.
 * Run `--demo` weekly, not daily.
 *
 * Usage:
 *   pnpm smoke:prod            # liveness + auth + authorization (writes nothing)
 *   pnpm smoke:prod --demo     # also exercises the landing demo button (WRITES)
 *
 * Override the target with PROD_SMOKE_BASE_URL (e.g. a preview deployment), and
 * the expected commit with PROD_SMOKE_EXPECTED_SHA — needed when the target is
 * NOT built from `main`, since the freshness check compares against `main` by
 * default and would otherwise report a preview as stale.
 */

const BASE_URL = (
	process.env.PROD_SMOKE_BASE_URL ?? PRODUCTION_SITE_URL
).replace(/\/+$/, "");

const RUN_DEMO_CHECK = process.argv.includes("--demo");

/**
 * Latency policy.
 *
 * `force-dynamic` (required by the nonce CSP — see `src/shared/http/notes/adr/001`)
 * puts a cold start on the critical path, so a slow first byte is EXPECTED here,
 * not a defect. Tuned to catch a real regression while staying quiet about the
 * known floor: 1.69s cold / 0.21–0.37s warm measured 2026-08-04, 2.39s cold on
 * 2026-08-05. WARN is advisory; FAIL means something changed structurally.
 */
const LATENCY = { failMs: 12_000, warnMs: 4000 } as const;

/**
 * The exact statuses asserted on.
 *
 * `SEE_OTHER` is a successful Server Action redirect; `TEMPORARY_REDIRECT` is the
 * proxy's auth guard turning away an unauthenticated document request. Asserting
 * the precise code rather than a 3xx range is deliberate — one becoming the other
 * would mean the redirect is coming from somewhere else.
 */
const HTTP_OK = 200;
const HTTP_SEE_OTHER = 303;
const HTTP_TEMPORARY_REDIRECT = 307;

const DASHBOARD_H1_REGEX = /<h1\b[^>]*>([^<]*)<\/h1>/;

const report = new SmokeReport(BASE_URL, LATENCY);

type SeededRole = "ADMIN" | "USER";

interface SubmissionResult {
	readonly location: string | null;
	readonly sessionCookie: string | null;
	readonly status: number;
}

/** Fetches a page, replays one of its server-action forms, returns the outcome. */
async function submitServerActionForm(
	path: string,
	marker: string,
	userFields: Readonly<Record<string, string>>,
): Promise<SubmissionResult> {
	const { body } = await report.fetch(path);
	const formData = buildServerActionBody(extractForm(body, marker), userFields);

	const { response } = await report.fetch(path, {
		body: formData,
		method: "POST",
	});

	const sessionCookie =
		response.headers
			.getSetCookie()
			.find((cookie) => cookie.startsWith("session="))
			?.split(";")[0] ?? null;

	return {
		location: response.headers.get("location"),
		sessionCookie,
		status: response.status,
	};
}

function seedCredentials(role: SeededRole): {
	email: string;
	password: string;
} {
	const seeded = seedUserInputs.find((user) => user.role === role);

	if (!seeded) {
		throw new Error(`no seeded ${role} in devtools/seed/data/seed.users.ts`);
	}

	return { email: seeded.email, password: seeded.password };
}

/** The database is reachable and the app says so. */
async function checkHealth(): Promise<void> {
	const { response, body, ms } = await report.fetch("/api/health");

	if (response.status !== HTTP_OK) {
		report.fail("/api/health", `expected ${HTTP_OK}, got ${response.status}`);
		return;
	}

	const health = JSON.parse(body) as { db?: string; status?: string };

	if (health.status !== "ok") {
		report.fail(
			"/api/health",
			`status is ${String(health.status)}, expected "ok"`,
		);
	}
	if (health.db !== "up") {
		report.fail(
			"/api/health",
			`db is ${String(health.db)}, expected "up" — Neon may be suspended or the connection string is stale`,
		);
	}

	report.note(`health ok in ${ms}ms (db ${String(health.db)})`);
}

/**
 * The landing page is the real one, not an error shell.
 *
 * Note what this canNOT tell you: `HERO_TAGLINE` is a stable constant, so an
 * older build passes this too. Staleness is `checkDeployFreshness`'s job.
 */
async function checkLanding(): Promise<void> {
	const { response, body, ms } = await report.fetch(ROUTES.root);

	if (response.status !== HTTP_OK) {
		report.fail(ROUTES.root, `expected ${HTTP_OK}, got ${response.status}`);
		return;
	}
	if (!body.includes(HERO_TAGLINE)) {
		report.fail(
			ROUTES.root,
			"hero tagline missing — the deployment is serving something other than the current landing page",
		);
		return;
	}

	report.note(`landing ok in ${ms}ms`);
}

/**
 * Authentication is ENFORCED, not merely available.
 *
 * A watchdog that only proves pages render would pass just as happily if the
 * dashboard were wide open, which is the worse failure of the two.
 */
async function checkUnauthenticatedRedirect(): Promise<void> {
	const { response } = await report.fetch(ROUTES.dashboard.root);
	const location = response.headers.get("location") ?? "";

	if (
		response.status !== HTTP_TEMPORARY_REDIRECT ||
		!location.includes(ROUTES.auth.login)
	) {
		report.fail(
			ROUTES.dashboard.root,
			`unauthenticated request got ${response.status} → ${location || "(no redirect)"}, expected ${HTTP_TEMPORARY_REDIRECT} → ${ROUTES.auth.login}. The dashboard may be publicly readable.`,
		);
		return;
	}

	report.note("unauthenticated dashboard correctly redirects to login");
}

/**
 * The authenticated shell renders, and (for ADMIN) role-gated navigation is
 * present — which proves authorization, not just authentication.
 */
async function checkDashboardRenders(
	label: string,
	sessionCookie: string,
	role: SeededRole,
): Promise<void> {
	const { response, body, ms } = await report.fetch(ROUTES.dashboard.root, {
		headers: { cookie: sessionCookie },
	});

	if (response.status !== HTTP_OK) {
		report.fail(
			label,
			`dashboard returned ${response.status} with a valid session cookie`,
		);
		return;
	}

	const heading = DASHBOARD_H1_REGEX.exec(body)?.[1];
	if (!heading) {
		report.fail(
			label,
			"dashboard rendered no <h1> — the authenticated shell is broken",
		);
	}
	if (!body.includes("self.__next_f")) {
		report.fail(
			label,
			"no flight payload in the dashboard document — the page will render but never hydrate",
		);
	}
	if (role === "ADMIN" && !body.includes(ROUTES.dashboard.users)) {
		report.fail(
			label,
			`admin session has no link to ${ROUTES.dashboard.users} — role-gated navigation is missing`,
		);
	}

	report.note(`${label} → "${heading ?? "?"}" in ${ms}ms`);
}

/** Logs in with seeded credentials and confirms the session actually works. */
async function checkSeededLogin(role: SeededRole): Promise<void> {
	const label = `login:${role.toLowerCase()}`;
	const { email, password } = seedCredentials(role);

	const result = await submitServerActionForm(
		ROUTES.auth.login,
		'data-cy="login-form"',
		{ email, password },
	);

	if (result.status !== HTTP_SEE_OTHER) {
		report.fail(
			label,
			`expected ${HTTP_SEE_OTHER} after submitting the login form, got ${result.status} — the seeded ${role} cannot sign in`,
		);
		return;
	}
	if (result.location !== ROUTES.dashboard.root) {
		report.fail(
			label,
			`redirected to ${String(result.location)}, expected ${ROUTES.dashboard.root}`,
		);
		return;
	}
	if (!result.sessionCookie) {
		report.fail(
			label,
			"no session cookie was set — login succeeded but issued nothing",
		);
		return;
	}

	await checkDashboardRenders(label, result.sessionCookie, role);
}

/**
 * The one-click demo button — the primary path a first-time visitor takes.
 *
 * WRITES: one `demo_user_counters` row and one permanent user per run.
 */
async function checkDemoButton(): Promise<void> {
	const result = await submitServerActionForm(
		ROUTES.auth.login,
		'aria-label="demo-user"',
		{},
	);

	if (
		result.status !== HTTP_SEE_OTHER ||
		result.location !== ROUTES.dashboard.root
	) {
		report.fail(
			"demo-button",
			`expected ${HTTP_SEE_OTHER} → ${ROUTES.dashboard.root}, got ${result.status} → ${String(result.location)} — the one-click demo is broken`,
		);
		return;
	}
	if (!result.sessionCookie) {
		report.fail(
			"demo-button",
			"demo user was created but no session cookie was set",
		);
		return;
	}

	await checkDashboardRenders("demo-button", result.sessionCookie, "USER");
	report.note("demo button created a user (one new row in demo_user_counters)");
}

async function main(): Promise<void> {
	console.log(`Production smoke against ${BASE_URL}`);

	await report.runCheck("/api/health", checkHealth);
	await report.runCheck("deploy-freshness", () => checkDeployFreshness(report));
	await report.runCheck(ROUTES.root, checkLanding);
	await report.runCheck("auth-guard", checkUnauthenticatedRedirect);
	await report.runCheck("login:user", () => checkSeededLogin("USER"));
	await report.runCheck("login:admin", () => checkSeededLogin("ADMIN"));

	if (RUN_DEMO_CHECK) {
		await report.runCheck("demo-button", checkDemoButton);
	}

	report.finish(
		`Production smoke passed${RUN_DEMO_CHECK ? " (including the demo button)" : ""}.`,
	);
}

main().catch((error: unknown) => {
	console.error("Production smoke errored:", error);
	process.exit(1);
});
