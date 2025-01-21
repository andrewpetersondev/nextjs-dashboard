import { verifySession } from "@/lib/dal";
import AdminDashboard from "@/ui/dashboard/admin-dashboard";
import UserDashboard from "@/ui/dashboard/user-dashboard";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await verifySession();
  const userRole = session?.user?.role;
  if (userRole === "admin") {
    return <AdminDashboard />;
  } else if (userRole === "user") {
    return <UserDashboard />;
  } else {
    redirect("/login");
  }
}