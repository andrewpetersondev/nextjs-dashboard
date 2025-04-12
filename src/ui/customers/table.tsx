import Image from "next/image";
import { lusitana } from "@/src/ui/fonts";
import Search from "@/src/ui/search";
import { FormattedCustomersTable } from "@/src/lib/definitions";

export default async function CustomersTable({
  customers,
}: {
  customers: FormattedCustomersTable[];
}) {
  return (
    <div className="w-full">
      <h1 className={`${lusitana.className} mb-8 text-xl md:text-2xl`}>
        Customers
      </h1>
      <Search placeholder="Search customers..." />
      <div className="mt-6 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-bg-accent p-2 md:pt-0">
              {/* Mobile View: Displaying each customer in a card layout */}
              <div className="md:hidden">
                {customers?.map((customer) => (
                  <div
                    key={customer.id}
                    className="mb-2 w-full rounded-md bg-bg-primary p-4"
                  >
                    {/* Customer info: name, profile picture, and email */}
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <div className="mb-2 flex items-center">
                          <div className="flex items-center gap-3">
                            <Image
                              src={customer.image_url}
                              className="rounded-full"
                              alt={`${customer.name}'s profile picture`}
                              width={28}
                              height={28}
                            />
                            <p>{customer.name}</p>
                          </div>
                        </div>
                        <p className="text-sm text-text-primary">
                          {customer.email}
                        </p>
                      </div>
                    </div>

                    {/* Customer financial details: pending and paid amounts */}
                    <div className="flex w-full items-center justify-between border-b py-5">
                      <div className="flex w-1/2 flex-col">
                        <p className="text-xs">Pending</p>
                        <p className="font-medium">{customer.total_pending}</p>
                      </div>
                      <div className="flex w-1/2 flex-col">
                        <p className="text-xs">Paid</p>
                        <p className="font-medium">{customer.total_paid}</p>
                      </div>
                    </div>

                    {/* Customer invoice total */}
                    <div className="pt-4 text-sm">
                      <p>{customer.total_invoices} invoices</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View: Displaying customers in a table layout */}
              <table className="hidden min-w-full rounded-md text-text-primary md:table">
                {/* Table header with column names */}
                <thead className="rounded-md bg-bg-accent text-left text-sm font-normal">
                  <tr>
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Email
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Total Invoices
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Total Pending
                    </th>
                    <th scope="col" className="px-4 py-5 font-medium">
                      Total Paid
                    </th>
                  </tr>
                </thead>

                {/* Table body with customer details */}
                <tbody className="divide-y divide-bg-primary text-text-primary">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="group">
                      {/* Customer name and profile picture */}
                      <td className="whitespace-nowrap bg-bg-accent py-5 pl-4 pr-3 text-sm text-text-primary group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-center gap-3">
                          <Image
                            src={customer.image_url}
                            className="rounded-full"
                            alt={`${customer.name}'s profile picture`}
                            width={28}
                            height={28}
                          />
                          <p>{customer.name}</p>
                        </div>
                      </td>

                      {/* Customer email */}
                      <td className="whitespace-nowrap bg-bg-accent px-4 py-5 text-sm">
                        {customer.email}
                      </td>

                      {/* Total invoices */}
                      <td className="whitespace-nowrap bg-bg-accent px-4 py-5 text-sm">
                        {customer.total_invoices}
                      </td>

                      {/* Total pending amount */}
                      <td className="whitespace-nowrap bg-bg-accent px-4 py-5 text-sm">
                        {customer.total_pending}
                      </td>

                      {/* Total paid amount */}
                      <td className="whitespace-nowrap bg-bg-accent px-4 py-5 text-sm group-first-of-type:rounded-md group-last-of-type:rounded-md">
                        {customer.total_paid}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}