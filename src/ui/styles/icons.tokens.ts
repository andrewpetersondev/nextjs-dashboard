/**
 * Shared sizing and colour for an icon sitting inside a text input.
 *
 * `pointer-events-none` is the load-bearing part: without it the icon swallows
 * clicks meant for the field it decorates.
 */
export const INPUT_ICON_CLASS =
	"pointer-events-none ml-2 h-[18px] w-[18px] text-text-accent";
