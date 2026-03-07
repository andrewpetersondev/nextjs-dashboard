import { databaseSeed } from "../seed/seed.task";
import { runCli } from "./run-cli";

console.log("seed-cli.ts ...");

void runCli(databaseSeed, "Database seeded successfully.");
