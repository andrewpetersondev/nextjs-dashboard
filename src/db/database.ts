import "dotenv/config";
import {drizzle} from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import pg from "pg";

const { Pool } = pg;

const connectionString = process.env.connection_string!;
console.log("connectionString", connectionString);

const pool = new Pool({
    connectionString: connectionString,
    max: 10,
});

pool.on('error', (error: Error) => {
    console.error('Unexpected error on idle client', error);
});

export const db = drizzle({ client: pool, schema });

