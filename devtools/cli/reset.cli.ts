import { resetDatabase } from "../db/reset.task";
import { runCli } from "./run-cli";

console.log("reset-cli.ts ...");

void runCli(resetDatabase, {
	errorLabel: "Error resetting database",
	successMessage: "Drizzle reset complete, tables remain, but values are gone.",
});
