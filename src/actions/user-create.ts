"use server";

import { createUserInDB } from "@/lib/data";
import { z } from "zod";
import { hashPassword } from "@/utils/password";
import bcrypt from "bcryptjs";

const SignupFormSchema = z.object({
  username: z
    .string()
    .min(2, { message: "Username must be at least 2 characters long." })
    .trim(),
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  password: z
    .string()
    .min(6, { message: "Be at least 6 characters long" })
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
  // Validate form fields
  const validatedFields = SignupFormSchema.safeParse({
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
  const { username, email, password } = validatedFields.data;
  const hashedPassword = await hashPassword(password);
  // const hashedPassword = await bcrypt.hash(password, 10);

  // Call the provider or db to create a user...
  //   let user;
  try {
    const data = await createUserInDB({
      username,
      email,
      password: hashedPassword,
    });
    // const user = data[0];
    // console.log(user);
    return { message: "User created successfully!" };
  } catch (error) {
    console.error(error);
    return { message: "Failed to create user." };
  }

}