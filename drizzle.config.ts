// import 'envConfig.ts'
// import { defineConfig } from "drizzle-kit";
// import fs from 'fs';

// const postgresUrlFile = process.env.POSTGRES_URL_FILE!;
// const url = fs.readFileSync(postgresUrlFile, 'utf8').trim();

// const postgresPasswordFile = process.env.POSTGRES_PASSWORD_FILE!;
// const password = fs.readFileSync(postgresPasswordFile, 'utf8').trim();

// if (!password) {
//   console.error("Missing required environment variables:");
//   console.error("POSTGRES_PASSWORD is not set");
//   process.exit(1);
// }

// export default defineConfig({
//   out: "./src/db/drizzle",
//   schema: "./src/db/schema.ts",
//   dialect: "postgresql",

//   dbCredentials: {
//     host: "db",
//     port: 5432,
//     user: "postgres",
//     password: password,
//     database: "postgres",
//     ssl: false,
//   },
//   migrations: {
//     schema: 'public',
//   },
//   schemaFilter: ["public"],
//   verbose: true,
//   strict: true,
// });

// I think this is the right way to do it, but I'm not sure

import 'envConfig.ts'
import { defineConfig } from "drizzle-kit";
import fs from 'fs';

const postgresUrlFile = process.env.POSTGRES_URL_FILE!;
const url = fs.readFileSync(postgresUrlFile, 'utf8').trim();

export default defineConfig({
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: url
  }
})