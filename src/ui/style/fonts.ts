import { Doto, Merienda, Noto_Sans, Tektur } from "next/font/google";

// doto is used for font-experiment
// tektur is used for headings
// notoSans is used for body text
// merienda is used for font-eyegrab

export const notoSans = Noto_Sans({
	subsets: ["latin"],
	display: "swap",
});

export const tektur = Tektur({
	subsets: ["latin"],
	display: "swap",
});

export const merienda = Merienda({
	subsets: ["latin"],
	display: "swap",
});

export const doto = Doto({
	subsets: ["latin"],
	display: "swap",
});
