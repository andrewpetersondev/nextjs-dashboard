// import type { NextAuthConfig } from "next-auth";
//
// export const authConfig = {
//   pages: {
//     signIn: "/login",
//   },
//   callbacks: {
//     authorized({ auth, request: { nextUrl } }) {
//       console.log("AuthConfig being used:", authConfig);
//       const isLoggedIn = !!auth?.user;
//       const isOnSite = nextUrl.pathname.startsWith("/");
//       if (isOnSite) {
//         return isLoggedIn;
//       }
//       return true;
//     },
//   },
//   providers: [],
//   cookies: {
//     sessionToken: {
//       name: process.env.NODE_ENV === "production"
//           ? "__Secure-next-auth.session-token"
//           : "next-auth.session-token",
//       options: {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "lax",
//       },
//     },
//   },
//   session: {
//     strategy: "jwt", // Or "database" depending on your use-case
//   },
//   debug: process.env.NODE_ENV === "development", // Debug mode for better error logs
//   secret: process.env.NEXTAUTH_SECRET, // Add your secret
// } satisfies NextAuthConfig;