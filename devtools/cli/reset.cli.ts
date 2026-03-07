import { resetDatabase } from "../database/reset.task";
import { runCli } from "./run-cli";

console.log("reset-cli.ts ...");

void runCli(
	resetDatabase,
	"Drizzle reset complete, tables remain, but values are gone.",
);
