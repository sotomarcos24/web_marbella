"use client";

import { useLenis } from "lenis/react";
import { useCallback, type RefObject } from "react";

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

/** Desplaza la ventana hasta el final de la escena; sin Lenis (reduced-motion) salta sin animar. */
export function useAvanzarAlFinal(contenedor: RefObject<HTMLElement | null>, duracion: number) {
  const lenisScrollTo = useLenisScroll();
  return useCallback(() => {
    const el = contenedor.current;
    if (!el) return;
    const fin = window.scrollY + el.getBoundingClientRect().bottom - window.innerHeight;
    if (!lenisScrollTo(fin, { duration: duracion })) window.scrollTo({ top: fin, behavior: "auto" });
  }, [contenedor, duracion, lenisScrollTo]);
}
