import Image from "next/image";

export default function Slashes() {
  return (
    <div className="relative min-h-44 border-[--pattern-fg] bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] bg-fixed [--pattern-fg:var(--color-black)]/5 max-lg:h-66 max-lg:border-t lg:border-l dark:[--pattern-fg:var(--color-white)]/10">
      <div className="relative p-6">
        <p className="text-white">
          This is a new paragraph added to the component.
        </p>
        <p className="text-white">Another paragraph for additional content.</p>
        <Image
          src="/customers/amy-burns.png"
          alt="customer image"
          className="rounded-full ml-10"
          width={100}
          height={100}
        />
      </div>
    </div>
  );
}
