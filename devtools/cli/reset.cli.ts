import { runCli } from "@devtools/cli/run-cli";
import { resetDatabase } from "@devtools/db/reset.task";

console.log("reset-cli.ts ...");

void runCli(resetDatabase, {
	errorLabel: "Error resetting database",
	successMessage: "Drizzle reset complete, tables remain, but values are gone.",
});
