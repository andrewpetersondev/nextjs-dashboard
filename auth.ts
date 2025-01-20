import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { getUserForAuth } from "@/actions/user-read";
import { comparePassword } from "@/utils/password";

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);
        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUserForAuth(email);

          if (!user) return null;

          // const passwordsMatch = await bcrypt.compare(password, user.password);
          const passwordsMatch = await comparePassword(password, user.password);

          if (passwordsMatch) {
            console.log("Valid credentials");
            console.log(user);
            return user;
          }
        }
        console.log("Invalid credentials");
        return null;
      },
    }),
  ],
});