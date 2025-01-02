import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { peopleTable } from "./schema";

// connection option 1
// import 'dotenv/config';
// import { drizzle } from 'drizzle-orm/node-postgres';
const db = drizzle(process.env.DATABASE_URL!);

// connection option 2
// import 'dotenv/config';
// import { drizzle } from 'drizzle-orm/node-postgres';
// You can specify any property from the node-postgres connection options
// const db = drizzle({
//   connection: {
//     connectionString: process.env.DATABASE_URL!,
//     ssl: true
//   }
// });

// connection option 3
// import 'dotenv/config';
// import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
// import { drizzle } from "drizzle-orm/node-postgres";
// import { Pool } from "pg";
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL!,
// });
// const db = drizzle({ client: pool });

async function main() {
  const person: typeof peopleTable.$inferInsert = {
    name: "John",
    age: 30,
    email: "john@example.com",
  };

  await db.insert(peopleTable).values(person);
  console.log("New person created!");

  const people = await db.select().from(peopleTable);
  console.log("Getting all people from the database: ", people);
  /*
    const people: {
      id: number;
      name: string;
      age: number;
      email: string;
    }[]
    */

  await db
    .update(peopleTable)
    .set({
      age: 31,
    })
    .where(eq(peopleTable.email, person.email));
  console.log("person info updated!");

  await db.delete(peopleTable).where(eq(peopleTable.email, person.email));
  console.log("person deleted!");
}

main();