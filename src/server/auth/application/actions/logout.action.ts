"use server";

import { redirect } from "next/navigation";
import { deleteSessionToken } from "@/server/auth/domain/session/core/session";

export async function logoutAction(): Promise<void> {
  await deleteSessionToken();
  redirect("/");
}
