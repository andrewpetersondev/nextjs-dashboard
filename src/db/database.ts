// import "dotenv/config";
// import { drizzle } from "drizzle-orm/node-postgres";
// import * as schema from "./schema";
// import pg from "pg";
// import fs from "fs";
// const postgresUrlFile = process.env.POSTGRES_URL_FILE!;
// const url = fs.readFileSync(postgresUrlFile, 'utf8').trim();
// if (!url) {
//     console.error("Missing required POSTGRES_URL environment variables:");
//     process.exit(1);
// }
// const { Pool } = pg;
// const pool = new Pool({
//     connectionString: url,
//     max: parseInt(process.env.PG_POOL_MAX || '10', 10),
//     idleTimeoutMillis: parseInt(process.env.PG_POOL_IDLE_TIMEOUT || '30000', 10),
//     connectionTimeoutMillis: parseInt(process.env.PG_POOL_CONNECTION_TIMEOUT || '2000', 10),
// });
// export const db = drizzle({ client: pool, schema });

// I think this is the right way to do it, but I'm not sure

import 'dotenv/config';
import { drizzle } from "drizzle-orm/node-postgres";
// import fs from "fs";
// const postgresUrlFile = process.env.POSTGRES_URL_FILE!;
// const url = fs.readFileSync(postgresUrlFile, 'utf8').trim();
// if (!url) {
//     console.error("Missing required POSTGRES_URL environment variable:");
//     process.exit(1);
// }
// export const db = drizzle("postgres://postgres:password@db:5432/postgres", { schema });
export const db = drizzle("postgres://postgres:password@db:5432/postgres");
