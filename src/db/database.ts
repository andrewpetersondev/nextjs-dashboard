import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

// connection from localhost to db container
// export const db = drizzle(process.env.DATABASE_URL!)

// connection from web-app to db container
export const db = drizzle(process.env.POSTGRES_URL!);