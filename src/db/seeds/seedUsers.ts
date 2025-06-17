import { db } from "@/src/db/dev-database";
import { users } from "@/src/db/schema";
import bcryptjs from "bcryptjs";

type User = {
	username: string;
	email: string;
	password: string;
};

const mockUsers: User[] = [
	{
		username: "username1",
		email: "username1@mail.com",
		password: "password",
	},
	{
		username: "username2",
		email: "username2@mail.com",
		password: "password",
	},
	{
		username: "username3",
		email: "username3@mail.com",
		password: "password",
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

try {
	seedUsers();
} catch (e) {
	console.error(e);
	throw new Error("some sort of error");
}
