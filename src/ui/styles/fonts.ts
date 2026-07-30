import { Noto_Sans, Tektur } from "next/font/google";

// tektur is used for headings
// notoSans is used for body text

export const notoSans = Noto_Sans({
	display: "swap",
	subsets: ["latin"],
});

export const tektur = Tektur({
	display: "swap",
	subsets: ["latin"],
});
