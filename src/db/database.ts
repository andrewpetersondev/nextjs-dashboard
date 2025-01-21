import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg"; // Postgres client

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL!,
  max: 10 // maximum pool size
});

export const db = drizzle({ client: pool });

console.log("[Database] Connected: ", process.env.POSTGRES_URL)

// await pool.end() // Here you can use node-pg pool, that was created before db