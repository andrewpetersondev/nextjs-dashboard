import "dotenv/config";
import {drizzle} from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import pg from "pg";

const {Pool} = pg;

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL!,
    max: 10,
});

// export const db = drizzle({ client: pool });
export const db = drizzle({client: pool, schema});
