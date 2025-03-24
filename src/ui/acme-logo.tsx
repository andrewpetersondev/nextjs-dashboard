import { GlobeAltIcon } from "@heroicons/react/24/outline";
import { Background } from "@/src/ui/background";

export default function AcmeLogo() {
  return (
    <Background pattern="dot">
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-primary-accent p-4 md:h-52">
        <div
          className="flex flex-row items-center leading-none text-3xl md:text-5xl"
        >
          <div className="sr-only">Acme Logo</div>
          <GlobeAltIcon className="h-12 w-12 rotate-[15deg]" />
          <h1 className="font-eyegrab text-eyegrab">Acme</h1>
        </div>
      </div>
    </Background>
  );
}