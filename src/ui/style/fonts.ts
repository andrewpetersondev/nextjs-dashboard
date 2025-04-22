import {
  Inter,
  Lusitana,
  Noto_Sans,
  Grenze_Gotisch,
  Tektur,
} from "next/font/google";

export const inter = Inter({ subsets: ["latin"] });

export const lusitana = Lusitana({
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const notoSans = Noto_Sans({
  subsets: ["latin"],
});

export const grenzeGotisch = Grenze_Gotisch({
  subsets: ["latin"],
  style: ["normal"],
});

export const tektur = Tektur({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  // display: "swap",
});
