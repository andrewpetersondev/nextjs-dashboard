"use server";

import { db } from "@/db/database";
import { users } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { SignupFormSchema, SignupFormState } from "@/types/definitions";

const CreateUser = SignupFormSchema.omit({});

export async function signup(state: SignupFormState, formData: FormData) {
  const validatedFields = CreateUser.safeParse({
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  console.log("validatedFields", validatedFields);
  const user = validatedFields;

  // Call the provider or db to create a user...
  try {
    const saltRounds = 10;
    const hashedUser = await Promise.all(
      user.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, saltRounds),
      })),
    );
    await db.insert(users).values(hashedUser);
    console.log("Users inserted!");
  } catch (e) {
    console.error("Error creating user");
    console.error(e);
    throw e;
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}