// "use server";
// // import { signIn } from "@/auth";
// // import { AuthError } from "next-auth";
//
// export async function authenticate(
//   prevState: string | undefined,
//   formData: FormData,
// ) {
//   try {
//     const email = formData.get("email")?.toString();
//     const password = formData.get("password")?.toString();
//     if (!email || !password) {
//       return "Email and password are required.";
//     }
//
//     // const result = await signIn("credentials", {
//     //   redirect: false,
//     //   email,
//     //   password,
//     // });
//     // if (result && result.error) {
//     //   switch (result.error) {
//     //     case "CredentialsSignin":
//     //       return "Invalid credentials.";
//     //     default:
//     //       return "Something went wrong.";
//     //   }
//     // }
//     // Successful login, optionally handle response here
//     return undefined; // No error message
//
//     // await signIn("credentials", formData);
//   } catch (error) {
//     console.error("Authentication error:", error);
//     return "Auth Actions --> Authentication error";
//     // if (error instanceof AuthError) {
//     //   switch (error.type) {
//     //     case "CredentialsSignin":
//     //       return "Invalid credentials.";
//     //     default:
//     //       return "Something went wrong.";
//     //   }
//     // }
//     // throw error;
//   }
// }