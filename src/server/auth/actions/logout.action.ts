"use server";

import { redirect } from "next/navigation";
import { deleteSessionToken } from "@/server/auth/session/session";

export async function logoutAction(): Promise<void> {
  await deleteSessionToken();
  redirect("/");
}
