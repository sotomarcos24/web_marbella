import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { focusRing } from "./styles";

type Variant = "primary" | "secondary" | "ghost";
type Tone = "light" | "dark";

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: "md" | "lg";
  /** "dark" para botones sobre fondo noche. */
  tone?: Tone;
};

// Cal sobre mar en claro y noche sobre cal en oscuro: el terracota no llega a AA con texto
// (combinaciones en textPairs de src/config/theme.ts).
const variants: Record<Tone, Record<Variant, string>> = {
  light: {
    primary: "bg-mar text-cal hover:bg-tinta",
    secondary: "border border-tinta text-tinta hover:bg-tinta hover:text-cal",
    ghost: "text-mar",
  },
  dark: {
    primary: "bg-cal text-noche hover:bg-arena",
    secondary: "border border-cal text-cal hover:bg-cal hover:text-noche",
    ghost: "text-cal",
  },
};

const ghost = "underline decoration-terracota underline-offset-4 hover:decoration-2";

const sizes = { md: "px-5 py-2.5 text-sm", lg: "px-7 py-3.5 text-base" };

export function Button({ variant = "primary", size = "md", tone = "light", type = "button", className, ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-colors duration-300",
        focusRing,
        "disabled:pointer-events-none disabled:opacity-50",
        variants[tone][variant],
        variant === "ghost" && ghost,
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
