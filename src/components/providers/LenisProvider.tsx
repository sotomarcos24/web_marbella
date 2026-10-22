"use client";

import { ReactLenis } from "lenis/react";
import { type ReactNode, useSyncExternalStore } from "react";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const prefersReducedMotion = () => window.matchMedia(REDUCED_MOTION).matches;

// Scroll suave sobre el scroll nativo de la ventana (compatible con useScroll y position: sticky);
// la instancia queda disponible con useLenis(). Se desactiva mientras el usuario prefiera reducir
// el movimiento. ReactLenis va junto a los hijos, no alrededor, para no remontarlos al cambiar.
export function LenisProvider({ children }: { children: ReactNode }) {
  const reduced = useSyncExternalStore(subscribe, prefersReducedMotion, () => true);

  return (
    <>
      {!reduced && <ReactLenis root />}
      {children}
    </>
  );
}
