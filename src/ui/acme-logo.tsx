import { GlobeAltIcon } from "@heroicons/react/24/outline";

export default function AcmeLogo() {
  return (
    <div
      className="flex flex-row items-center leading-none text-3xl md:text-5xl"
    >
      <div className="sr-only">Acme Logo</div>
      <GlobeAltIcon className="h-12 w-12 rotate-[15deg]" />
      <h1 className="font-eyegrab text-eyegrab">Acme</h1>
    </div>
  );
}