"use server";

import { z } from "zod";
import { comparePassword, hashPassword } from "@/lib/password"; // A utility for comparing hashed password
import { createSession } from "@/lib/session"; // To create a session upon successful login
import { redirect } from "next/navigation";
import { db } from "@/db/database";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const SignupFormSchema = z.object({
  username: z
    .string()
    .min(2, { message: "Username must be at least 2 characters long." })
    .trim(),
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  password: z
    .string()
    .min(8, { message: "Be at least 8 characters long" })
    .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
    .regex(/[0-9]/, { message: "Contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Contain at least one special character.",
    })
    .trim(),
});
type SignupFormState =
  | {
      errors?: {
        username?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

async function createUserInDB({
  username,
  email,
  password,
}: {
  username: string;
  email: string;
  password: string;
}) {
  try {
    const data = await db
      .insert(users)
      .values({
        username: username,
        email: email,
        password: password,
      })
      .returning({ insertedId: users.id });
    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to create user in database.");
    //   throw error;
  }
}

export async function userCreate(state: SignupFormState, formData: FormData) {
  const validatedFields = SignupFormSchema.safeParse({
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  const { username, email, password } = validatedFields.data;
  try {
    const hashedPassword = await hashPassword(password);
    const data = await createUserInDB({
      username,
      email,
      password: hashedPassword,
    });
    const userId = data[0]?.insertedId;
    if (!userId) {
      return { message: "Failed to retrieve user ID." };
    }
    await createSession(userId);
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to create user. Please try again.",
    };
  }
  redirect("/dashboard");
}

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
        role: users.role,
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