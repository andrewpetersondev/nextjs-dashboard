import "server-only";

// Data Access Layer centralizes data requests and authorization logic.
// Cookies (aka Stateless Sessions) and Database Sessions should have their  own DAL & DTO layers
// The DAL should include a function that verifies the user's session as they interact with your application.
// At the very least, the function should check if the session is valid,
// then redirect or return the user information needed to make further requests.
//
// There are two main types of authorization checks:
//
// Optimistic: Checks if the user is authorized to access a route or perform an action using the session data stored in
// the cookie. These checks are useful for quick operations, such as showing/hiding UI elements or redirecting users
// based on permissions or roles.
// Secure: Checks if the user is authorized to access a route or perform an action using
// the session data stored in the database. These checks are more secure and are used for operations that require
// access to sensitive data or actions.
//
// For both cases, we recommend:
// Creating a Data Access Layer to centralize your authorization logic
// Using Data Transfer Objects (DTO) to only return the necessary data
// Optionally use Middleware to perform optimistic checks.

import { cache } from "react";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
// import { validate as isUUID } from "uuid";
import { redirect } from "next/navigation";
// import { db } from "@/db/database";
// import { sessions, users } from "@/db/schema";
// import { eq } from "drizzle-orm";

export const verifySessionOptimistic = cache(async () => {
  const cookie = (await cookies()).get("session")?.value;

  if (!cookie) {
    console.error("No session cookie found");
    redirect("/login");
  }

  const session = await decrypt(cookie);

  const session = await decrypt(cookie);

  if (!session || !session.user || !session.user.userId) {
    console.error("Invalid session or missing user information");
    redirect("/login");
  }

  return {
    isAuthorized: true,
    userId: session.user.userId,
    role: session.user.role,
  };
});

// this reads cookies, then makes a db call to get more information about the user
// its purpose is to
// 1. increase security
// 2. implement a cache to avoid unnecessary duplicate requests to the db during a render pass
// export const getUser = cache(async () => {
//   const { isAuthorized, userId } = await verifySessionOptimistic();
//   if (!isAuthorized || !userId || !isUUID(userId)) {
//     return null;
//   }
//   try {
//     // this request is supposed to get data from the cookie to improve authentication/authorization
//     // the request is meant to use db table (users.id) and cookie (sessions.user.userId)
//     const data = await db
//       .select()
//       .from(users)
//       .where(eq(session.user.userId, users.id));
//
//     const user = data[0];
//
//     return user;
//   } catch (error) {
//     console.error("Failed to fetch user:", error);
//     return null;
//   }
// });
