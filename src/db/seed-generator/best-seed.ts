import { seed } from "drizzle-seed";
import * as schema from "./schema";

const customerFullNames = [
  "Evil Rabbits",
  "Delba de Oliveira",
  "Lee Robinson",
  "Michael Novotny",
  "Amy Burns",
  "Balazs Orban",
];

const customerEmails = [
  "evil@rabbit.com",
  "delba@oliveira.com",
  "lee@robinson.com",
  "michael@novotny.com",
  "amy@burns.com",
  "balazs@orban.com",
];

const customerImageUrls = [
  "/customers/evil-rabbit.png",
  "/customers/delba-de-oliveira.png",
  "/customers/lee-robinson.png",
  "/customers/michael-novotny.png",
  "/customers/amy-burns.png",
  "/customers/balazs-orban.png",
];

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface User {
  username: string;
  email: string;
  password: string;
}

const users: User[] = [
  {
    username: "User",
    email: "user@nextmail.com",
    password: "123456", // Note: You'll need to hash this before seeding
  },
];

async function main() {
  const db = drizzle(process.env.DATABASE_URL!);

  await seed(db, schema).refine((f) => ({
    users: {
      count: 1,
      columns: {
        username: f.default({ defaultValue: users[0].username }),
        email: f.default({ defaultValue: users[0].email }),
        password: f.default({ defaultValue: users[0].password }),
      },
    },
    customers: {
      count: 6,
      columns: {
        name: f.valuesFromArray({ values: customerFullNames }),
        email: f.valuesFromArray({ values: customerEmails }),
        image_url: f.valuesFromArray({ values: customerImageUrls }),
      },
      with: {
        invoices: [
          { weight: 0.6, count: [1, 2, 3] },
          { weight: 0.3, count: [4, 5] },
          { weight: 0.1, count: [6, 7, 8] },
        ],
      },
    },
    invoices: {
      columns: {
        amount: f.int({ minValue: 100, maxValue: 10000 }),
        date: f.date({ minDate: "2023-01-01", maxDate: "2024-01-01" }),
        paymentStatus: f.valuesFromArray({ values: ["pending", "paid"] }),
      },
    },
    revenue: {
      count: 12,
      columns: {
        month: f.valuesFromArray({ values: months, isUnique: true }),
        revenue: f.int({ minValue: 100000, maxValue: 900000 }),
      },
    },
  }));
}

main();