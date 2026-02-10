import { Doto, Merienda, Noto_Sans, Tektur } from "next/font/google";

// doto is used for font-experiment
// tektur is used for headings
// notoSans is used for body text
// merienda is used for font-eyegrab

// biome-ignore lint/nursery/useExplicitType: <fix later>
export const notoSans = Noto_Sans({
  display: "swap",
  subsets: ["latin"],
});

// biome-ignore lint/nursery/useExplicitType: <fix later>
export const tektur = Tektur({
  display: "swap",
  subsets: ["latin"],
});

// biome-ignore lint/nursery/useExplicitType: <fix later>
export const merienda = Merienda({
  display: "swap",
  subsets: ["latin"],
});

// biome-ignore lint/nursery/useExplicitType: <fix later>
export const doto = Doto({
  display: "swap",
  subsets: ["latin"],
});
