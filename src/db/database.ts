import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
// import { Pool } from "pg";
import pg from "pg";

// I may need to import schema so db.query will work
import * as schema from "./schema";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL!,
  max: 10,
});

// export const db = drizzle({ client: pool });
export const db = drizzle({ client: pool, schema });

console.log("[Database] Connected: ", process.env.POSTGRES_URL);
