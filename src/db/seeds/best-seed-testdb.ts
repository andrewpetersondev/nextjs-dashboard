// ANY FILE THAT IS USED FOR CLI TOOLING CANNOT HAVE IMPORT "SERVER-ONLY"
// DRIZZLE CLI, NODE, AND TSX DO NOT SUPPORT "SERVER-ONLY" OR "USE-SERVER"

import "dotenv/config";
import { seed } from "drizzle-seed";
import { hashPassword } from "../../lib/password";
import * as schema from "../schema";
import { testDB } from "../test-database";

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
	role: "admin" | "user";
}

const userSeed: User[] = [
	{
		username: "user",
		email: "user@mail.com",
		password: await hashPassword("Password123!"),
		role: "user",
	},
	{
		username: "admin",
		email: "admin@mail.com",
		password: await hashPassword("AdminPassword123!"),
		role: "admin",
	},
];

async function main() {
	// Check if the database is empty
	const { rows: userCount } = (await testDB.execute(
		"SELECT COUNT(*) FROM users",
	)) as { rows: { count: number }[] };
	const { rows: customerCount } = (await testDB.execute(
		"SELECT COUNT(*) FROM customers",
	)) as { rows: { count: number }[] };
	const { rows: invoiceCount } = (await testDB.execute(
		"SELECT COUNT(*) FROM invoices",
	)) as { rows: { count: number }[] };
	const { rows: revenueCount } = (await testDB.execute(
		"SELECT COUNT(*) FROM revenues",
	)) as { rows: { count: number }[] };
	if (
		userCount[0].count > 0 ||
		customerCount[0].count > 0 ||
		invoiceCount[0].count > 0 ||
		revenueCount[0].count > 0
	) {
		console.error("Database is not empty. Exiting...");
		return;
	}

	await seed(testDB, schema).refine((f) => ({
		users: {
			count: 2,
			columns: {
				username: f.valuesFromArray({
					values: userSeed.map((u) => u.username),
					isUnique: true,
				}),
				email: f.valuesFromArray({
					values: userSeed.map((u) => u.email),
					isUnique: true,
				}),
				password: f.valuesFromArray({
					values: userSeed.map((u) => u.password),
					isUnique: true,
				}),
				role: f.valuesFromArray({
					values: userSeed.map((u) => u.role),
					isUnique: true,
				}),
			},
		},
		customers: {
			count: 6,
			columns: {
				name: f.valuesFromArray({ values: customerFullNames, isUnique: true }),
				email: f.valuesFromArray({ values: customerEmails, isUnique: true }),
				imageUrl: f.valuesFromArray({
					values: customerImageUrls,
					isUnique: true,
				}),
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
			count: 15,
			columns: {
				amount: f.weightedRandom([
					{
						weight: 1 / 15, // For the first record
						value: f.default({ defaultValue: 1000 }),
					},
					{
						weight: 14 / 15, // For remaining records
						value: f.int({ minValue: 100, maxValue: 10000 }),
					},
				]),
				date: f.date({ minDate: "2024-01-01", maxDate: "2025-01-01" }),
				status: f.valuesFromArray({ values: ["pending", "paid"] }),
			},
		},
		revenues: {
			count: 12,
			columns: {
				month: f.valuesFromArray({ values: months, isUnique: true }),
				revenue: f.int({ minValue: 100, maxValue: 10000 }),
			},
		},
	}));
}

main().catch((error) => {
	console.error("Error seeding database:", error);
	process.exit(1);
});
