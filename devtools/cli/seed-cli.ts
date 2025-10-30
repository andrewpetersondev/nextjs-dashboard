/** biome-ignore-all lint/correctness/noProcessGlobal: <cli only> */
import "../config/load-env";
import { databaseSeed } from "./seed-db";

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
