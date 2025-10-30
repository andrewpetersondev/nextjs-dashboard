/** biome-ignore-all lint/correctness/noProcessGlobal: <cli only> */
import "../config/load-env";
import { resetDatabase } from "./reset-db";

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
