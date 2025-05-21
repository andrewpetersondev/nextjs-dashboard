import "server-only";

// Using Data Transfer Objects (DTO)
//
// **DTOs** are simple objects used to **transfer data between layers or
// components of an application**, particularly between:
//
// - The backend and the frontend.
// - The service layer and any callers (e.g., API response, client consumer).
//
// DTOs act as a filter/translator for backend data, ensuring that only the required data (and in the required format)
// is passed to the user or the consumer of the API. They protect the application by not exposing sensitive or
// unnecessary internal data structures.
//
// When retrieving data, it's recommended you return only the necessary data that
// will be used in your application, and not entire objects. For example, if you're fetching user data, you might only
// return the user's ID and name, rather than the entire user object which could contain passwords, phone numbers, etc.
//  However, if you have no control over the returned data structure, or are working in a team where you want to avoid
// whole objects being passed to the client, you can use strategies such as specifying what fields are safe to be
// exposed to the client.

// import { getUser } from "@/lib/dal";
// import type { User } from "@/lib/definitions";

// Remove or comment out any db import and usage
// import { db } from "@/db/database";
// import { eq } from "drizzle-orm";
// import { users } from "@/db/schema";

// function canSeeUsername(viewer: User) {
//   return true;
// }

// function canSeePhoneNumber(viewer: User, team: string) {
//   return viewer.isAdmin || team === viewer.team;
// }

// export async function getProfileDTO(slug: string) {
//   const data = await db.query.users.findMany({
//     where: eq(users.slug, slug), // Return specific columns here
//   });
//   const user = data[0];
//
//   const currentUser = await getUser(user.id);
//
//   // Or return only what's specific to the query here
//   return {
//     username: canSeeUsername(currentUser) ? user.username : null,
//     phonenumber: canSeePhoneNumber(currentUser, user.team)
//       ? user.phonenumber
//       : null,
//   };
// }
