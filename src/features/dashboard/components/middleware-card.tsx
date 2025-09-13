import type { JSX } from "react";
import { verifySessionOptimistic } from "@/server/auth/session";
import { AUTH_ROLES, type AuthRole, ROLES } from "@/shared/auth/domain/roles";
import type { SessionVerificationResult } from "@/shared/auth/sessions/dto/types";
import { H6 } from "@/ui/atoms/typography/headings";

const allowedRoles: readonly AuthRole[] = AUTH_ROLES;

export async function MiddlewareCard(): Promise<JSX.Element> {
  const session: SessionVerificationResult = await verifySessionOptimistic();

  const role: AuthRole = allowedRoles.includes(session.role as AuthRole)
    ? (session.role as AuthRole)
    : ROLES.GUEST; // fallback to 'guest' if invalid

  const userId: string = String(session.userId);
  const authy: boolean = Boolean(session.isAuthorized);

  return (
    <ul data-cy="middleware-card">
      <li className="font-experiment">User Id: {userId} in experiment font</li>
      <li>
        <p>Role: {role} in eyegrab font</p>
      </li>
      <li>
        <H6>{authy ? "Authorized" : "Not Authorized"} in tektur font</H6>
      </li>
      <li>in notosans font</li>
    </ul>
  );
}
