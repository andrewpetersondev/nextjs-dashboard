import "dotenv/config";
import {drizzle} from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import pg from "pg";
import fs from "fs";

const { Pool } = pg;

const connectionString = fs.readFileSync("/run/secrets/connection_string", "utf8").trim();

const pool = new Pool({
    connectionString: connectionString,
    max: 10,
});

pool.on('error', (error: Error) => {
    console.error('Unexpected error on idle client', error);
});

export const db = drizzle({ client: pool, schema });

