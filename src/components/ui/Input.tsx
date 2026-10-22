import { type ComponentProps, useId } from "react";
import { cn } from "@/lib/cn";
import { focusRing } from "./styles";

type InputProps = Omit<ComponentProps<"input">, "id"> & {
  label: string;
  hint?: string;
  error?: string;
};

// Campo con etiqueta siempre visible; la ayuda y el error se anuncian con aria-describedby.
export function Input({ label, hint, error, className, ...props }: InputProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={cn(
          "rounded-sm border bg-cal px-4 py-3 text-tinta placeholder:text-tinta/70",
          focusRing,
          error ? "border-terracota" : "border-tinta/60",
        )}
        {...props}
      />
      {hint && (
        <p id={hintId} className="text-sm text-tinta/80">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm font-medium text-tinta">
          {error}
        </p>
      )}
    </div>
  );
}
