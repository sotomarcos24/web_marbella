// Une clases de Tailwind ignorando las vacías o condicionales falsas.
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
