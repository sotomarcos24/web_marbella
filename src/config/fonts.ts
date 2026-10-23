import localFont from "next/font/local";

// Serif de display (títulos grandes, con cursiva) y sans para el texto: fuentes variables de
// @fontsource-variable, servidas en local para compilar sin conexión. Las variables CSS las recoge
// el @theme de src/app/globals.css como --font-display y --font-sans.
// next/font exige argumentos literales: las rutas no pueden generarse.
const display = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource-variable/cormorant-garamond/files/cormorant-garamond-latin-wght-normal.woff2",
      weight: "300 700",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource-variable/cormorant-garamond/files/cormorant-garamond-latin-wght-italic.woff2",
      weight: "300 700",
      style: "italic",
    },
  ],
  variable: "--font-cormorant",
  display: "swap",
});

const sans = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-dm-sans",
  display: "swap",
});

export const fontVariables = `${display.variable} ${sans.variable}`;
