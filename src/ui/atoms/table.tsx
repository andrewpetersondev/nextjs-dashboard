import type { ComponentProps, JSX } from "react";
import { cn } from "@/ui/utils/cn";

/**
 * A responsive table container that forwards the ref to the underlying table element.
 */
// biome-ignore lint/style/useExportsLast: <explanation>
export function Table({
  className,
  ref,
  ...props
}: ComponentProps<"table">): JSX.Element {
  return (
    <div className="relative w-full overflow-auto">
      <table
        className={cn(
          "w-full caption-bottom text-sm text-text-primary",
          className,
        )}
        ref={ref}
        {...props}
      />
    </div>
  );
}
Table.displayName = "Table";

/**
 * The table header section.
 */
export function TableHeader({
  className,
  ref,
  ...props
}: ComponentProps<"thead">): JSX.Element {
  return (
    <thead className={cn("[&_tr]:border-b", className)} ref={ref} {...props} />
  );
}
TableHeader.displayName = "TableHeader";

/**
 * The table body section.
 */
export function TableBody({
  className,
  ref,
  ...props
}: ComponentProps<"tbody">): JSX.Element {
  return (
    <tbody
      className={cn("bg-bg-primary [&_tr:last-child]:border-0", className)}
      ref={ref}
      {...props}
    />
  );
}
TableBody.displayName = "TableBody";

/**
 * The table footer section.
 */
export function TableFooter({
  className,
  ref,
  ...props
}: ComponentProps<"tfoot">): JSX.Element {
  return (
    <tfoot
      className={cn(
        "border-t bg-bg-accent/50 font-medium [&>tr]:last:border-b-0",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
}
TableFooter.displayName = "TableFooter";

/**
 * A table row.
 */
export function TableRow({
  className,
  ref,
  ...props
}: ComponentProps<"tr">): JSX.Element {
  return (
    <tr
      className={cn(
        "border-b transition-colors hover:bg-bg-active/50 data-[state=selected]:bg-bg-active",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
}
TableRow.displayName = "TableRow";

/**
 * A table header cell (th).
 */
export function TableHead({
  className,
  ref,
  ...props
}: ComponentProps<"th">): JSX.Element {
  return (
    <th
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-text-secondary [&:has([role=checkbox])]:pr-0",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
}
TableHead.displayName = "TableHead";

/**
 * A standard table data cell (td).
 */
export function TableCell({
  className,
  ref,
  ...props
}: ComponentProps<"td">): JSX.Element {
  return (
    <td
      className={cn(
        "p-4 align-middle [&:has([role=checkbox])]:pr-0",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
}
TableCell.displayName = "TableCell";

/**
 * The table caption.
 */
export function TableCaption({
  className,
  ref,
  ...props
}: ComponentProps<"caption">): JSX.Element {
  return (
    <caption
      className={cn("mt-4 text-sm text-text-secondary", className)}
      ref={ref}
      {...props}
    />
  );
}
TableCaption.displayName = "TableCaption";
