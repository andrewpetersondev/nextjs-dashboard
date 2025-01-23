import { verifySession } from "@/lib/dal";

export default async function MiddlewareCard() {
  const session = await verifySession();
  const userId = session?.userId;
  const role = session?.role;
  const authy = session?.isAuthenticated;
  // const expires = session?.expiresAt;

  return (
    <div>
      <p>{userId}</p>
      <p>{role}</p>
      {authy && <p>true</p>}
      {!authy && <p>false</p>}
      <p>{authy}</p>
      {/*<p>{expires}</p>*/}
    </div>
  );
}