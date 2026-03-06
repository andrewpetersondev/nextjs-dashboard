import process from "node:process";
import { resetDatabase } from "./reset-db.js";

console.log("reset-cli.ts ...");

resetDatabase()
	.then((): void => {
		console.log("Drizzle reset complete, tables remain, but values are gone.");
		process.exit(0);
	})
	.catch((error) => {
		console.error("Error resetting database:", error);
		process.exit(1);
	});
