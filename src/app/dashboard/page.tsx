import { Card } from "@/src/ui/dashboard/cards";
import RevenueChart from "@/src/ui/dashboard/revenue-chart";
import LatestInvoices from "@/src/ui/dashboard/latest-invoices";
import { lusitana } from "@/src/ui/fonts";
import {
  fetchRevenue,
  fetchLatestInvoices,
  fetchCardData,
} from "@/src/lib/data";

export default async function Page() {
  const revenue = await fetchRevenue();
  const latestInvoices = await fetchLatestInvoices();
  const { invoiceCount, pendingInvoices, paidInvoices, customerCount } =
    await fetchCardData();
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Collected" value={paidInvoices} type="collected" />
        <Card title="Pending" value={pendingInvoices} type="pending" />
        <Card title="Total Invoices" value={invoiceCount} type="invoices" />
        <Card title="Total Customers" value={customerCount} type="customers" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <RevenueChart revenue={revenue} />
        <LatestInvoices latestInvoices={latestInvoices} />
      </div>
    </main>
  );
}