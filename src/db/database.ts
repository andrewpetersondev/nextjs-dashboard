import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

// connection from localhost to db container
export const db = drizzle({ client: pool });

// connection from web-app to db container
// export const db = drizzle(process.env.POSTGRES_URL!);