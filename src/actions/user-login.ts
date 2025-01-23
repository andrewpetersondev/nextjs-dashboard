"use server";

import { z } from "zod";
import { comparePassword } from "@/lib/password"; // A utility for comparing hashed password
import { createSession } from "@/lib/session"; // To create a session upon successful login
import { db } from "@/db/database";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

const LoginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  password: z.string().min(8, { message: "Password is required." }).trim(),
});

type LoginFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export async function userLogin(state: LoginFormState, formData: FormData) {
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  const { email, password } = validatedFields.data;
  try {
    // Fetch the user by email from the database
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        password: users.password,
      })
      .from(users)
      .where(eq(users.email, email));
    if (!user.length) {
      return { message: "Invalid email or password." };
    }
    const validPassword = await comparePassword(password, user[0].password);
    if (!validPassword) {
      return { message: "Invalid email or password." };
    }
    // Create a session (reuse or update the session as needed)
    await createSession(user[0].id);
  } catch (error) {
    console.error("Failed to log in user:", error);
    return { message: "An unexpected error occurred. Please try again." };
  }
  redirect("/dashboard");
}