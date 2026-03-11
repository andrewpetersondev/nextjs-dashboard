import { runCli } from "@devtools/cli/run-cli";
import { databaseSeed } from "@devtools/seed/seed.task";

void runCli(databaseSeed, {
	errorLabel: "Error seeding database",
	successMessage: "Database seeded successfully.",
});
