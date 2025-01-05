import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
// import * as orm from "drizzle-orm/";

export const db = drizzle(process.env.DATABASE_URL!);