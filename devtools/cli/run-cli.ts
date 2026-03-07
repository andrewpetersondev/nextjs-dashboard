import process from "node:process";

/**
 * Wraps a CLI task and handles errors.
 * Unifies seed and reset CLI tasks.
 * @param task
 * @param successMessage
 */
export async function runCli(
	task: () => Promise<void>,
	successMessage: string,
): Promise<void> {
	try {
		await task();
		console.log(successMessage);
		process.exit(0);
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
}
