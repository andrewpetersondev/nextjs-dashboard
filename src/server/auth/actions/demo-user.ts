"use server";

import { redirect } from "next/navigation";
import { toUserRole } from "@/features/users/lib/to-user-role";
import { USER_ERROR_MESSAGES } from "@/features/users/messages";
import { setSessionToken } from "@/server/auth/session";
import { getDB } from "@/server/db/connection";
import { serverLogger } from "@/server/logging/serverLogger";
import { createDemoUser } from "@/server/users/dal/create-demo-user";
import { demoUserCounter } from "@/server/users/dal/demo-user-counter";
import {
  type ActionResult,
  actionResult,
} from "@/shared/action-result/action-result";
import type { AuthRole } from "@/shared/auth/roles";
import { toUserId } from "@/shared/brands/domain-brands";
import type { UserDto } from "@/shared/users/dto";

/**
 * Creates a demo user and logs them in.
 */
export async function demoUser(
  role: AuthRole = toUserRole("guest"),
): Promise<ActionResult> {
  let demoUser: UserDto | null = null;
  const db = getDB();
  try {
    const counter: number = await demoUserCounter(db, toUserRole(role));
    if (!counter) {
      serverLogger.error({
        context: "demoUser",
        message: "Counter is zero or undefined",
        role,
      });

      throw new Error("Counter is zero or undefined");
    }
    demoUser = await createDemoUser(db, counter, toUserRole(role));
    if (!demoUser) {
      serverLogger.error({
        context: "demoUser",
        message: "Demo user creation failed",
        role,
      });
      throw new Error("Demo user creation failed");
    }
    await setSessionToken(toUserId(demoUser.id), toUserRole(role));
  } catch (error) {
    serverLogger.error({
      context: "demoUser",
      demoUser,
      error,
      message: USER_ERROR_MESSAGES.UNEXPECTED,
      role,
    });
    return actionResult({
      errors: { _root: [USER_ERROR_MESSAGES.UNEXPECTED] },
      message: USER_ERROR_MESSAGES.UNEXPECTED,
      success: false,
    });
  }
  redirect("/dashboard");
}
