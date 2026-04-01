import type { ComponentProps, JSX } from "react";
import { cn } from "@/ui/utils/cn";

/**
 * Responsive table wrapper.
 */
// biome-ignore lint/style/useExportsLast: this follows convention
export function Table({
	className,
	...props
}: ComponentProps<"table">): JSX.Element {
	return (
		<div className="relative w-full overflow-auto">
			<table
				{...props}
				className={cn(
					"w-full caption-bottom text-sm text-text-primary",
					className,
				)}
			/>
		</div>
	);
}

Table.displayName = "Table";

/**
 * Table head section.
 */
export function TableHeader({
	className,
	...props
}: ComponentProps<"thead">): JSX.Element {
	return <thead {...props} className={cn("[&_tr]:border-b", className)} />;
}

TableHeader.displayName = "TableHeader";

/**
 * Table body section.
 */
export function TableBody({
	className,
	...props
}: ComponentProps<"tbody">): JSX.Element {
	return (
		<tbody
			{...props}
			className={cn("bg-bg-primary [&_tr:last-child]:border-0", className)}
		/>
	);
}

TableBody.displayName = "TableBody";

/**
 * Table footer section.
 */
export function TableFooter({
	className,
	...props
}: ComponentProps<"tfoot">): JSX.Element {
	return (
		<tfoot
			{...props}
			className={cn(
				"border-t bg-bg-accent/50 font-medium [&>tr]:last:border-b-0",
				className,
			)}
		/>
	);
}

TableFooter.displayName = "TableFooter";

/**
 * Table row.
 */
export function TableRow({
	className,
	...props
}: ComponentProps<"tr">): JSX.Element {
	return (
		<tr
			{...props}
			className={cn(
				"border-b transition-colors hover:bg-bg-active/50 data-[state=selected]:bg-bg-active",
				className,
			)}
		/>
	);
}

TableRow.displayName = "TableRow";

/**
 * Table header cell.
 */
export function TableHead({
	className,
	...props
}: ComponentProps<"th">): JSX.Element {
	return (
		<th
			{...props}
			className={cn(
				"h-12 px-4 text-left align-middle font-medium text-text-secondary [&:has([role=checkbox])]:pr-0",
				className,
			)}
		/>
	);
}

TableHead.displayName = "TableHead";

/**
 * Table data cell.
 */
export function TableCell({
	className,
	...props
}: ComponentProps<"td">): JSX.Element {
	return (
		<td
			{...props}
			className={cn(
				"p-4 align-middle [&:has([role=checkbox])]:pr-0",
				className,
			)}
		/>
	);
}

TableCell.displayName = "TableCell";

/**
 * Table caption.
 */
export function TableCaption({
	className,
	...props
}: ComponentProps<"caption">): JSX.Element {
	return (
		<caption
			{...props}
			className={cn("mt-4 text-sm text-text-secondary", className)}
		/>
	);
}

TableCaption.displayName = "TableCaption";
