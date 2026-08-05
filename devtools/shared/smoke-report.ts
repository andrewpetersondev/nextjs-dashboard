import process from "node:process";

/**
 * Collects the findings of a probe run against a live deployment, and owns the
 * HTTP plumbing those findings come from.
 *
 * Three severities, because a watchdog that can only say "pass" or "fail" is
 * either noisy or useless:
 *
 *   - FAILURE — something is broken; the process exits non-zero.
 *   - WARNING — worth reporting, not worth waking anyone; exit stays zero.
 *   - NOTE    — the evidence a passing run actually checked something, which is
 *               what makes a green result trustworthy rather than assumed.
 *
 * Every check records into one of these instead of throwing, so a single hard
 * error can never discard findings already collected. That distinction is the
 * whole value of the report for diagnosis: you want the full picture of what is
 * broken, not the first thing that broke.
 */

/** Generous: an idle Vercel deployment has measured ~2.5s to first byte cold. */
const REQUEST_TIMEOUT_MS = 30_000;

export interface TimedResponse {
	readonly body: string;
	readonly ms: number;
	readonly response: Response;
}

export interface LatencyPolicy {
	readonly failMs: number;
	readonly warnMs: number;
}

export class SmokeReport {
	private readonly failures: string[] = [];
	private readonly warnings: string[] = [];
	private readonly notes: string[] = [];

	private readonly baseUrl: string;
	private readonly latency: LatencyPolicy;

	constructor(baseUrl: string, latency: LatencyPolicy) {
		this.baseUrl = baseUrl;
		this.latency = latency;
	}

	fail(where: string, message: string): void {
		this.failures.push(`${where}: ${message}`);
	}

	warn(where: string, message: string): void {
		this.warnings.push(`${where}: ${message}`);
	}

	note(message: string): void {
		this.notes.push(message);
	}

	/** One request, with its time-to-full-body recorded and classified. */
	async fetch(path: string, init?: RequestInit): Promise<TimedResponse> {
		const started = Date.now();
		const response = await fetch(`${this.baseUrl}${path}`, {
			redirect: "manual",
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
			...init,
		});
		const body = await response.text();
		const ms = Date.now() - started;

		if (ms >= this.latency.failMs) {
			this.fail(path, `took ${ms}ms (fail threshold ${this.latency.failMs}ms)`);
		} else if (ms >= this.latency.warnMs) {
			this.warn(path, `took ${ms}ms (warn threshold ${this.latency.warnMs}ms)`);
		}

		return { body, ms, response };
	}

	/**
	 * Runs one check in isolation so a thrown error becomes a recorded failure
	 * rather than an aborted run.
	 */
	async runCheck(label: string, check: () => Promise<void>): Promise<void> {
		try {
			await check();
		} catch (error: unknown) {
			this.fail(
				label,
				error instanceof Error ? error.message : `threw ${String(error)}`,
			);
		}
	}

	/** Prints everything collected and exits non-zero if anything failed. */
	finish(successMessage: string): void {
		for (const note of this.notes) {
			console.log(`  · ${note}`);
		}

		if (this.warnings.length > 0) {
			console.warn("\nWarnings (not failures):");
			for (const warning of this.warnings) {
				console.warn(`  ! ${warning}`);
			}
		}

		if (this.failures.length > 0) {
			console.error("\nFAILED:");
			for (const failure of this.failures) {
				console.error(`  ✗ ${failure}`);
			}
			process.exit(1);
		}

		console.log(`\n${successMessage}`);
	}
}
