import clsx from "clsx";
import { type ForwardedRef, forwardRef, type JSX } from "react";

/**
 * Outer container for page layout.
 */
export const ContainerOuter = forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(function OuterContainer(
  { className, children, ...props },
  ref: ForwardedRef<HTMLDivElement>,
): JSX.Element {
  return (
    <div className={clsx("sm:px-8", className)} ref={ref} {...props}>
      <div className="mx-auto w-full max-w-7xl lg:px-8">{children}</div>
    </div>
  );
});

/**
 * Inner container for content alignment.
 */
export const ContainerInner = forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(function InnerContainer(
  { className, children, ...props },
  ref: ForwardedRef<HTMLDivElement>,
): JSX.Element {
  return (
    <div
      className={clsx("relative px-4 sm:px-8 lg:px-12", className)}
      ref={ref}
      {...props}
    >
      <div className="mx-auto max-w-2xl lg:max-w-5xl">{children}</div>
    </div>
  );
});

export const Container = forwardRef<
  React.ElementRef<typeof ContainerOuter>,
  React.ComponentPropsWithoutRef<typeof ContainerOuter>
>(function Container(
  { children, ...props },
  ref: ForwardedRef<HTMLDivElement>,
): JSX.Element {
  return (
    <ContainerOuter ref={ref} {...props}>
      <ContainerInner>{children}</ContainerInner>
    </ContainerOuter>
  );
});
