"use server";

import { redirect } from "next/navigation";
import { deleteSessionToken } from "@/server/auth/session";

/**
 * Logs out the current user and redirects to home.
 */
export async function logout(): Promise<void> {
  await deleteSessionToken();
  redirect("/");
}
