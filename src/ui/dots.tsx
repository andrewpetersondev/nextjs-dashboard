import Image from "next/image";

export default function Dots() {
  return (
    <div className="bg-[radial-gradient(#ffffff33_1px,transparent_2px)] bg-primary-accent bg-[size:16px_16px] bg-repeat min-h-44">
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
  );
}
