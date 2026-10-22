import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type HeadingProps = ComponentProps<"h1"> & {
  /** Nivel semántico (h1–h6). */
  level: 1 | 2 | 3 | 4 | 5 | 6;
  /** Tamaño visual, independiente del nivel. */
  size?: "display" | "xl" | "lg" | "md";
};

const sizes = {
  display: "text-display font-light",
  xl: "text-heading-xl font-light",
  lg: "text-heading-lg font-normal",
  md: "text-heading-md font-medium",
};

// Serif de display; un <em> dentro del título sale en cursiva (contraste de la referencia).
export function Heading({ level, size = "lg", className, ...props }: HeadingProps) {
  const Tag = `h${level}` as const;
  return <Tag className={cn("font-display text-balance [&_em]:italic", sizes[size], className)} {...props} />;
}
