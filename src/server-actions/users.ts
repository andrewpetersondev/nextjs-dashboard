"use server";

import { comparePassword, hashPassword } from "@/lib/password";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/db/database";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  SignupFormSchema,
  type SignupFormState,
  LoginFormSchema,
  type LoginFormState,
} from "@/lib/definitions";

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
  // 1. Get data from form and validate it
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

  // 2. Prepare data for insertion into database
  const { username, email, password } = validatedFields.data;

  const hashedPassword = await hashPassword(password);

  // 3. Insert the user into the database or call an Library API
  // 3. Is this the Data Access Layer - (DAL)??
  const data = await db
    .insert(users)
    .values({
      username: username,
      email: email,
      password: hashedPassword,
    })
    .returning({ insertedId: users.id });
  const userId = data[0]?.insertedId;

  if (!userId) {
    return { message: "Failed to create account. Please try again." };
  }

  // 4. Create user session
  await createSession(userId);

  // 5. Redirect user
  redirect("/dashboard");
  // try {
  // } catch (error) {
  //   console.error(error);
  //   return {
  //     success: false,
  //     message: "Failed to create user. Please try again.",
  //   };
  // }
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

export async function logout() {
  await deleteSession();
  redirect("/");
}
