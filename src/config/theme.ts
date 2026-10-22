// Paleta (provisional). Mismos hex que el @theme de src/app/globals.css (ver tests/design-tokens.test.ts).
export const palette = {
  cal: "#F7F2EA",
  arena: "#E6D3B3",
  terracota: "#C2603E",
  oliva: "#6B7350",
  mar: "#1F3A4D",
  tinta: "#2B2420",
  noche: "#14110F",
} as const;

export type ColorToken = keyof typeof palette;

export type TextPair = { text: ColorToken; background: ColorToken; size: "normal" | "large"; opacity?: number };

// Combinaciones de texto permitidas; src/lib/contrast.test.ts comprueba que todas cumplen AA
// (normal ≥ 4.5, grande ≥ 3). "large" = ≥ 24 px, o ≥ 18,66 px en negrita. `opacity` cubre clases
// como text-tinta/70: no usar en texto una opacidad que no esté aquí.
export const textPairs: TextPair[] = [
  { text: "tinta", background: "cal", size: "normal" },
  { text: "mar", background: "cal", size: "normal" },
  { text: "noche", background: "cal", size: "normal" },
  { text: "tinta", background: "cal", size: "normal", opacity: 0.8 },
  { text: "tinta", background: "cal", size: "normal", opacity: 0.7 },
  { text: "terracota", background: "cal", size: "large" },
  { text: "oliva", background: "cal", size: "large" },
  { text: "tinta", background: "arena", size: "normal" },
  { text: "mar", background: "arena", size: "normal" },
  { text: "cal", background: "mar", size: "normal" },
  { text: "cal", background: "tinta", size: "normal" },
  { text: "noche", background: "arena", size: "normal" },
  { text: "cal", background: "noche", size: "normal" },
  { text: "arena", background: "noche", size: "normal" },
];
