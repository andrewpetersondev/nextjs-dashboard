import process from "node:process";

interface RunCliOptions {
	readonly errorLabel: string;
	readonly successMessage: string;
}

/**
 * Wraps a CLI task and handles success/error reporting.
 */
export async function runCli(
	task: () => Promise<void>,
	{ successMessage, errorLabel }: RunCliOptions,
): Promise<void> {
	try {
		await task();
		console.log(successMessage);
		process.exit(0);
	} catch (error) {
		console.error(`${errorLabel}:`, error);
		process.exit(1);
	}
}
