"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

// Scroll suave sobre el scroll nativo de la ventana (compatible con useScroll y position: sticky);
// la instancia queda disponible con useLenis(). Se desactiva mientras el usuario prefiera reducir
// el movimiento. ReactLenis va junto a los hijos, no alrededor, para no remontarlos al cambiar.
export function LenisProvider({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();

  return (
    <>
      {!reduced && <ReactLenis root />}
      {children}
    </>
  );
}
