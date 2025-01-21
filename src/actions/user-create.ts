"use server";

import { createUserInDB } from "@/lib/data";
import { z } from "zod";
import { hashPassword } from "@/utils/password";
import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";

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
  // Return a success indicator for the client to process.
  return {
    success: true,
    message: "User created successfully.",
    redirect: redirect("/dashboard"),
  };
}