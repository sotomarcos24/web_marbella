import { Cormorant_Garamond, DM_Sans } from "next/font/google";

// Serif de display (títulos grandes, con cursiva) y sans para el texto. Las variables CSS
// las recoge el @theme de src/app/globals.css como --font-display y --font-sans.
const display = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const fontVariables = `${display.variable} ${sans.variable}`;
