import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type ContainerProps = ComponentProps<"div"> & { as?: "div" | "section" | "main" | "header" | "footer" };

export function Container({ as: Tag = "div", className, ...props }: ContainerProps) {
  return <Tag className={cn("mx-auto w-full max-w-6xl px-4 sm:px-8", className)} {...props} />;
}
