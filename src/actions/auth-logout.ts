"use server";

// import { cookies } from 'next/headers'
import { deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function logout() {
  await deleteSession();
  redirect("/");
}