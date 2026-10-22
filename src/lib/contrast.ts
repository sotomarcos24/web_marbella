// Canales 0–255 de un color "#RRGGBB".
const rgb = (hex: string) => [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));

// Luminancia relativa (WCAG 2.x).
function luminance(hex: string): number {
  const [r = 0, g = 0, b = 0] = rgb(hex).map((value) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Color resultante de pintar `color` con opacidad `alpha` (0–1) sobre `background`.
export function blend(color: string, background: string, alpha: number): string {
  const back = rgb(background);
  const channels = rgb(color).map((value, i) =>
    Math.round(value * alpha + (back[i] ?? 0) * (1 - alpha))
      .toString(16)
      .padStart(2, "0"),
  );
  return `#${channels.join("")}`.toUpperCase();
}

// Ratio de contraste WCAG entre dos colores, de 1 a 21 (AA: 4.5 texto normal, 3 texto grande).
export function contrastRatio(a: string, b: string): number {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (lighter + 0.05) / (darker + 0.05);
}
