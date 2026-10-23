"use client";

import { useLenis } from "lenis/react";
import { useCallback } from "react";

type Opciones = { duration?: number; onComplete?: () => void };

/** Desplaza la ventana con Lenis. Devuelve false si no hay instancia (p. ej. con reduced-motion). */
export function useLenisScroll() {
  const lenis = useLenis();
  return useCallback(
    (destino: number, opciones?: Opciones) => {
      if (!lenis) return false;
      lenis.scrollTo(destino, opciones);
      return true;
    },
    [lenis],
  );
}
