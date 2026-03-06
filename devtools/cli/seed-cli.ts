import process from "node:process";
import { databaseSeed } from "./seed-db.js";

console.log("seed-cli.ts ...");

databaseSeed()
	.then((): void => {
		console.log("Database seeded successfully.");
		process.exit(0);
	})
	.catch((error) => {
		console.error("Error seeding database:", error);
		process.exit(1);
	});
