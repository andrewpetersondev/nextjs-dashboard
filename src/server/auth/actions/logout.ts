"use server";

import { redirect } from "next/navigation";
import { deleteSessionToken } from "@/server/auth/session";

export async function logout(): Promise<void> {
  await deleteSessionToken();
  redirect("/");
}
