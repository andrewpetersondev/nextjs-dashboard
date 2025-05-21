import Image from "next/image";

export default function Dots() {
  return (
    <div className="bg-bg-accent min-h-44 bg-[radial-gradient(#ffffff33_1px,transparent_2px)] bg-[size:16px_16px] bg-repeat">
      <p className="text-text-primary">
        This is a new paragraph added to the component.
      </p>
      <p className="text-text-primary">Another paragraph for additional content.</p>
      <Image
        src="/customers/amy-burns.png"
        alt="customer image"
        className="ml-10 rounded-full"
        width={100}
        height={100}
      />
    </div>
  );
}
