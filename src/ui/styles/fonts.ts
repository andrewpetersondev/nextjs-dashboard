import { Noto_Sans, Tektur } from "next/font/google";

/**
 * Body text face.
 *
 * `display: "swap"` renders fallback text immediately and swaps when the webfont
 * arrives, trading a reflow for never showing an invisible paragraph.
 */
export const notoSans = Noto_Sans({
	display: "swap",
	subsets: ["latin"],
});

/** Heading face, paired with {@link notoSans} for body copy. */
export const tektur = Tektur({
	display: "swap",
	subsets: ["latin"],
});
