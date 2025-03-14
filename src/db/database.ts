import "dotenv/config";
import {drizzle} from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import pg from "pg";

const { Pool } = pg;

const connectionString = process.env.POSTGRES_URL!;
console.log("Postgres connectionString ", connectionString);

const pool = new Pool({
    connectionString: connectionString!,
    max: parseInt(process.env.PG_POOL_MAX || '10', 10), 
});

pool.on('connect', () => {
    console.log('Connected to Postgres');
});
pool.on('acquire', () => {
    console.log('Client has been acquired');
});
pool.on('remove', () => {
    console.log('Client has been closed');
});
pool.on('error', (error: Error) => {
    console.error('Unexpected error on idle client', error);
});

export const db = drizzle({ client: pool, schema });

