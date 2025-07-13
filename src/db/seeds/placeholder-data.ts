/**
 * @file placeholder-data.ts
 * @description
 * Provides mock data types and values for seeding and testing the database.
 *
 * - Isolated from any server-only code for Drizzle Kit compatibility.
 * - Types are defined locally to avoid import issues with CLI tools.
 * - Do **not** use in production code.
 */
/** biome-ignore-all lint/style/noNonNullAssertion: <the data exists> */

type UserMock = {
  username: string;
  email: string;
  password: string;
};

type CustomerMock = {
  id: string;
  name: string;
  email: string;
  image_url: string;
};

type InvoiceMock = {
  customer_id: string;
  amount: number;
  status: "pending" | "paid";
  date: string; // ISO date string
};

type RevenueMock = {
  month: string;
  revenue: number;
};

export const users: UserMock[] = [
  {
    email: "user@nextmail.com",
    password: "123456",
    username: "User",
  },
];

export const customers: CustomerMock[] = [
  {
    email: "evil@rabbit.com",
    id: "d6e15727-9fe1-4961-8c5b-ea44a9bd81aa",
    image_url: "/customers/evil-rabbit.png",
    name: "Evil Rabbit",
  },
  {
    email: "delba@oliveira.com",
    id: "3958dc9e-712f-4377-85e9-fec4b6a6442a",
    image_url: "/customers/delba-de-oliveira.png",
    name: "Delba de Oliveira",
  },
  {
    email: "lee@robinson.com",
    id: "3958dc9e-742f-4377-85e9-fec4b6a6442a",
    image_url: "/customers/lee-robinson.png",
    name: "Lee Robinson",
  },
  {
    email: "michael@novotny.com",
    id: "76d65c26-f784-44a2-ac19-586678f7c2f2",
    image_url: "/customers/michael-novotny.png",
    name: "Michael Novotny",
  },
  {
    email: "amy@burns.com",
    id: "CC27C14A-0ACF-4F4A-A6C9-D45682C144B9",
    image_url: "/customers/amy-burns.png",
    name: "Amy Burns",
  },
  {
    email: "balazs@orban.com",
    id: "13D07535-C59E-4157-A011-F8D2EF4E0CBB",
    image_url: "/customers/balazs-orban.png",
    name: "Balazs Orban",
  },
];

export const invoices: InvoiceMock[] = [
  {
    amount: 15795,
    customer_id: customers[0]!.id,
    date: "2022-12-06",
    status: "pending",
  },
  {
    amount: 20348,
    customer_id: customers[1]!.id,
    date: "2022-11-14",
    status: "pending",
  },
  {
    amount: 3040,
    customer_id: customers[4]!.id,
    date: "2022-10-29",
    status: "paid",
  },
  {
    amount: 44800,
    customer_id: customers[3]!.id,
    date: "2023-09-10",
    status: "paid",
  },
  {
    amount: 34577,
    customer_id: customers[5]!.id,
    date: "2023-08-05",
    status: "pending",
  },
  {
    amount: 54246,
    customer_id: customers[2]!.id,
    date: "2023-07-16",
    status: "pending",
  },
  {
    amount: 666,
    customer_id: customers[0]!.id,
    date: "2023-06-27",
    status: "pending",
  },
  {
    amount: 32545,
    customer_id: customers[3]!.id,
    date: "2023-06-09",
    status: "paid",
  },
  {
    amount: 1250,
    customer_id: customers[4]!.id,
    date: "2023-06-17",
    status: "paid",
  },
  {
    amount: 8546,
    customer_id: customers[5]!.id,
    date: "2023-06-07",
    status: "paid",
  },
  {
    amount: 500,
    customer_id: customers[1]!.id,
    date: "2023-08-19",
    status: "paid",
  },
  {
    amount: 8945,
    customer_id: customers[5]!.id,
    date: "2023-06-03",
    status: "paid",
  },
  {
    amount: 1000,
    customer_id: customers[2]!.id,
    date: "2022-06-05",
    status: "paid",
  },
];

export const revenue: RevenueMock[] = [
  { month: "Jan", revenue: 2000 },
  { month: "Feb", revenue: 1800 },
  { month: "Mar", revenue: 2200 },
  { month: "Apr", revenue: 2500 },
  { month: "May", revenue: 2300 },
  { month: "Jun", revenue: 3200 },
  { month: "Jul", revenue: 3500 },
  { month: "Aug", revenue: 3700 },
  { month: "Sep", revenue: 2500 },
  { month: "Oct", revenue: 2800 },
  { month: "Nov", revenue: 3000 },
  { month: "Dec", revenue: 4800 },
];
