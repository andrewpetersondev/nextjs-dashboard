/**
 * Tailwind classes for the sweeping highlight on loading placeholders.
 *
 * The effect is a `::before` pseudo-element that slides across, so the element
 * carrying this class must also set `relative` and `overflow-hidden` — without
 * them the highlight is positioned against the wrong ancestor and spills out.
 */
export const shimmer =
	"before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-linear-to-r before:from-transparent before:via-white/60 before:to-transparent";
