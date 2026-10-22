import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type CardProps = ComponentProps<"div"> & { tone?: "light" | "dark" };

const tones = {
  light: "border border-arena bg-cal text-tinta",
  dark: "border border-cal/10 bg-noche text-cal",
};

export function Card({ tone = "light", className, ...props }: CardProps) {
  return <div className={cn("rounded-sm p-6 sm:p-8", tones[tone], className)} {...props} />;
}
