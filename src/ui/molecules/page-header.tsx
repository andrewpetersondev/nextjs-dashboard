import Image from "next/image";
import type { FC, ReactNode } from "react";
import { IMAGE_SIZES } from "@/ui/images.tokens";

interface PageHeaderProps {
  /** Main heading text */
  title: string;
  /** Optional sub-content or description */
  children?: ReactNode;
  /** Alt text for the logo */
  logoAlt?: string;
  /** Source URL for the logo */
  logoSrc?: string;
}

/**
 * PageHeader
 * A reusable header molecule with an optional logo and title.
 * commonly used at the top of card-based layouts or auth pages.
 */
export const PageHeader: FC<PageHeaderProps> = ({
  title,
  children,
  logoSrc,
  logoAlt = "Company Logo",
}: PageHeaderProps) => {
  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      {logoSrc && (
        <Image
          alt={logoAlt}
          className="mx-auto h-10 w-auto"
          height={IMAGE_SIZES.medium}
          priority={true}
          src={logoSrc}
          width={IMAGE_SIZES.medium}
        />
      )}
      <h2 className="mt-6 text-center font-bold text-2xl/9 text-text-primary tracking-tight">
        {title}
      </h2>
      {children}
    </div>
  );
};
