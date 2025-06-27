import bcryptjs from "bcryptjs";
import { db } from "@/src/lib/db/dev-database.ts";
import { users } from "@/src/lib/db/schema.ts";

type User = {
	username: string;
	email: string;
	password: string;
};

const mockUsers: User[] = [
	{
		email: "username1@mail.com",
		password: "password",
		username: "username1",
	},
	{
		email: "username2@mail.com",
		password: "password",
		username: "username2",
	},
	{
		email: "username3@mail.com",
		password: "password",
		username: "username3",
	},
];

async function seedUsers(): Promise<void> {
	const saltRounds = 10;
	const hashedUsers: User[] = await Promise.all(
		mockUsers.map(async (user: User) => ({
			...user,
			password: await bcryptjs.hash(user.password, saltRounds),
		})),
	);
	await db
		.insert(users)
		.values(hashedUsers)
		.then(() => {
			console.log("Users inserted successfully");
			console.log("Hashed Users", hashedUsers);
		})
		.catch((error) => console.error("Error inserting users:", error));
}

// (async () => {
//   try {
//     await seedUsers();
//   } catch (error) {
//     console.error("Error during seeding:", error);
//     throw new Error("Seeding failed. Please check the logs for more details.");
//   }
// })();

// Fix: Handle floating promise with .catch for error logging
try {
	seedUsers().catch((error) => {
		console.error("Error during seeding:", error);
		throw new Error("Seeding failed. Please check the logs for more details.");
	});
} catch (e) {
	console.error(e);
	throw new Error("some sort of error");
}
