"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term) => {
    // console.log("Searching .. ", term);
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 3000);

  return (
    <div className="relative flex flex-1 shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        // className="peer block w-full rounded-md border border-text-active py-[9px] pl-10 text-sm outline-2 placeholder:text-text-disabled"
        className="peer block w-full rounded-md border border-[color:var(--color-text-active)]
                 bg-[color:var(--color-bg-primary)] text-[color:var(--color-text-primary)]
                 py-[9px] pl-10 text-sm outline-2
                 placeholder:text-[color:var(--color-text-disabled)]
                 hover:border-[color:var(--color-text-hover)]
                 focus:border-[color:var(--color-text-focus)]
                 focus:outline-none focus:ring-2
                 focus:ring-[color:var(--color-bg-focus)] focus:ring-opacity-20
                 transition-colors duration-200"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get("query")?.toString()}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-text-focus" />
    </div>
  );
}
