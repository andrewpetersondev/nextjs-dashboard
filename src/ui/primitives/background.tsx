// import clsx from "clsx";
// import { forwardRef, type JSX } from "react";
// import { ContainerInner, ContainerOuter } from "@/ui/container";
//
// type Pattern = "grid" | "dot";
//
// /**
//  * Background component with optional pattern.
//  */
// export const _Background = forwardRef<
//   React.ElementRef<"div">,
//   React.ComponentPropsWithoutRef<"div"> & { pattern?: Pattern }
// >(function Background(
//   { className, children, pattern, ...props },
//   ref,
// ): JSX.Element {
//   const patternClass =
//     pattern === "grid"
//       ? "bg-grid-pattern"
//       : pattern === "dot"
//         ? "bg-dot-pattern"
//         : "";
//   return (
//     <ContainerOuter
//       className={clsx(patternClass, className)}
//       ref={ref}
//       {...props}
//     >
//       <ContainerInner>{children}</ContainerInner>
//     </ContainerOuter>
//   );
// });
