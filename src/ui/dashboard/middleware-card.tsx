import { verifySessionOptimistic } from "@/src/lib/dal";

export default async function MiddlewareCard() {
  const session = await verifySessionOptimistic();
  const userId = session?.userId;
  const role = session?.role;
  const authy = session?.isAuthorized;

  return (
    <div>
      <p>{userId}</p>
      <p>{role}</p>
      <p>{authy ? "Authorized" : "Not Authorized"}</p>
    </div>
  );
}
