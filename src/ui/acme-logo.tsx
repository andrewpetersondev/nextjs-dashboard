import { GlobeAltIcon } from "@heroicons/react/24/outline";
import { lusitana } from "@/src/ui/fonts";

export default function AcmeLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center leading-none text-white`}
    >
      <span className="sr-only">Acme Logo</span>
      <GlobeAltIcon className="h-12 w-12 rotate-[15deg]" />
      <p className="text-[44px]">Acme</p>
    </div>
  );
}