"use server";

import { comparePassword, hashPassword } from "@/src/lib/password";
import { createSession, deleteSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/src/db/database";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import {
  SignupFormSchema,
  type SignupFormState,
  LoginFormSchema,
  type LoginFormState,
} from "@/src/lib/definitions";

// TODO: Rewrite all functions for stateless authentication by creating cookies on the server.
// To create a cookie I need users.id, sessions.userId, expiresAt, users.role
// users.id is created in database
// sessions.userId is created in db, may not be necessary because it gives the same info as users.id
// expiresAt is created in code and encrypt ()
// for  now, every user's role is set to "user" by default from the db.
// soon I will determine who is an admin based off an enumerated list of email addresses.
// i do not have access to  users.role in signup () because the only thing that gets returned is users.id, so i will
// hardcode in the user role to signup()
// signup () can be part of the DAL because verifySessionOptimistic() is impossible without database sessions
export async function signup(state: SignupFormState, formData: FormData) {
  try {
    const validatedFields = SignupFormSchema.safeParse({
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (!validatedFields.success) {
      // console.log("Validation failed:", validatedFields.error.flatten().fieldErrors);
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }
    const { username, email, password } = validatedFields.data;
    const hashedPassword = await hashPassword(password);
    // console.log("Password hashed successfully");
    const data = await db
      .insert(users)
      .values({
        username: username,
        email: email,
        password: hashedPassword,
      })
      .returning({ insertedId: users.id });
    const userId = data[0]?.insertedId;
    // console.log("userId = ", userId);
    if (!userId) {
      console.log("Failed to create account");
      return { message: "Failed to create account. Please try again." };
    }
    await createSession(userId);
    // console.log("Session created successfully");
  } catch (error) {
    console.error("Failed to create user:", error);
    return { message: "An unexpected error occurred. Please try again." };
  }
  return redirect("/dashboard");
}

export async function login(
  state: LoginFormState,
  formData: FormData,
): Promise<
  | {
    errors: { email?: string[] | undefined; password?: string[] | undefined };
    message?: undefined;
  }
  | { message: string; errors?: undefined }
> {
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
        userId: users.id,
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
    await createSession(user[0].userId);
  } catch (error) {
    console.error("Failed to log in user:", error);
    return { message: "An unexpected error occurred. Please try again." };
  }
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/");
}

export async function deleteUser(userId: string) {
  try {
    await db
      .delete(users)
      .where(eq(users.id, userId));
  } catch (error) {
    console.error("Failed to delete user:", error);
    throw new Error("An unexpected error occurred. Please try again.");
  }
  redirect("/");
}

export async function demoUser() {
  const DEMO_EMAIL = "demo@demo.com";
  const DEMO_USERNAME = "Demo User";
  const DEMO_PASSWORD = "demopassword";

  let user: Array<{ userId: string; email: string; role: string }>;
  try {
    user = await db
      .select({
        userId: users.id,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.email, DEMO_EMAIL));
  } catch (error) {
    console.error("Failed to query demo user:", error);
    return { message: "An unexpected error occurred. Please try again." };
  }

  let demoUserId: string;
  if (user.length) {
    demoUserId = user[0].userId;
  } else {
    try {
      const hashedPassword = await hashPassword(DEMO_PASSWORD);
      const data = await db
        .insert(users)
        .values({
          username: DEMO_USERNAME,
          email: DEMO_EMAIL,
          password: hashedPassword,
        })
        .returning({ insertedId: users.id });
      demoUserId = data[0]?.insertedId;
      if (!demoUserId) {
        return { message: "Failed to create demo user. Please try again." };
      }
    } catch (error) {
      console.error("Failed to create demo user:", error);
      return { message: "An unexpected error occurred. Please try again." };
    }
  }
  try {
    await createSession(demoUserId);
  } catch (error) {
    console.error("Failed to create session for demo user:", error);
    return { message: "An unexpected error occurred. Please try again." };
  }

  return redirect("/dashboard");
}
