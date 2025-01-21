import { verifySession } from "@/lib/dal";
import AdminDashboard from "@/ui/dashboard/admin-dashboard";
import UserDashboard from "@/ui/dashboard/user-dashboard";
import { redirect } from "next/navigation";
// import { CardWrapper } from "@/src/ui/dashboard/cards";
// import RevenueChart from "@/src/ui/dashboard/revenue-chart";
// import LatestInvoices from "@/src/ui/dashboard/latest-invoices";
// import { lusitana } from "@/src/ui/fonts";
// import { Suspense } from "react";
// import {
//   RevenueChartSkeleton,
//   LatestInvoicesSkeleton,
//   CardsSkeleton,
// } from "@/src/ui/skeletons";

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

  // return (
  //     <main>
  //         <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
  //             Admin Dashboard
  //         </h1>
  //         <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
  //             <Suspense fallback={<CardsSkeleton />}>
  //                 <CardWrapper />
  //             </Suspense>
  //         </div>
  //         <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
  //             <Suspense fallback={<RevenueChartSkeleton />}>
  //                 <RevenueChart />
  //             </Suspense>
  //             <Suspense fallback={<LatestInvoicesSkeleton />}>
  //                 <LatestInvoices />
  //             </Suspense>
  //         </div>
  //     </main>
  // );
}