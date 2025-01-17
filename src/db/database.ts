import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

const { Pool } = pg;

// connection from localhost to db container
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

// connection from web-app to db container
// const pool = new Pool({
//   connectionString: process.env.POSTGRES_URL!,
// });

export const db = drizzle({ client: pool });