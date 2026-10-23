"use client";

import { animate, motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import {
  escalaInicio,
  escalaLlegada,
  haLlegado,
  opacidadFinal,
  opacidadLlegada,
} from "@/lib/scenes/progreso";
import type { ManifiestoSecuencia } from "@/lib/scenes/tipos";
import { useLenisScroll } from "@/lib/scenes/useLenisScroll";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

interface ScrollSequenceProps {
  /** Imagen fija de partida y foto real de llegada. */
  inicio: string;
  llegada: string;
  alt: string;
  /** Texto accesible del botón del modo clic. */
  etiqueta: string;
  /** scroll: el progreso es el scroll de la escena. clic: avanza solo al pulsar el botón. */
  modo?: "scroll" | "clic";
  /** Modo clic dentro del flujo de scroll: avanza con lenis.scrollTo en vez de animate(). */
  enFlujo?: boolean;
  /** Alto del contenedor en pantallas (modo scroll o en flujo). */
  pantallas?: number;
  /** Duración del avance automático, en segundos. */
  duracion?: number;
  onLlegada?: () => void;
  /** Reservado para los fotogramas de la Fase 4; sin uso aún. */
  manifiesto?: ManifiestoSecuencia;
}

const imagen = "absolute inset-0 size-full object-cover will-change-transform";

// Sustituto sin vídeo (docs/vision.md §3.4): fundido + zoom suave de inicio a llegada con un único
// progreso 0–1, y en el último 5 % se funde con la foto real. Contenedor alto + hijo sticky (§3.1).
export function ScrollSequence({
  inicio,
  llegada,
  alt,
  etiqueta,
  modo = "scroll",
  enFlujo = false,
  pantallas = 3,
  duracion = 3,
  onLlegada,
}: ScrollSequenceProps) {
  const contenedor = useRef<HTMLDivElement>(null);
  const emitida = useRef(false);
  const reducido = usePrefersReducedMotion();
  const lenisScrollTo = useLenisScroll();

  const { scrollYProgress } = useScroll({ target: contenedor, offset: ["start start", "end end"] });
  const manual = useMotionValue(0);
  const alto = modo === "scroll" || enFlujo;
  const progreso = alto ? scrollYProgress : manual;

  useMotionValueEvent(progreso, "change", (valor) => {
    if (!haLlegado(valor)) {
      emitida.current = false;
    } else if (!emitida.current) {
      emitida.current = true;
      onLlegada?.();
    }
  });

  const escalaI = useTransform(progreso, (p) => escalaInicio(p, reducido));
  const escalaL = useTransform(progreso, (p) => escalaLlegada(p, reducido));
  const opacidadL = useTransform(progreso, (p) => opacidadLlegada(p, reducido));
  const opacidadF = useTransform(progreso, (p) => opacidadFinal(p, reducido));

  function avanzar() {
    const el = contenedor.current;
    if (!enFlujo || !el) {
      animate(manual, 1, { duration: duracion, ease: "easeInOut" });
      return;
    }
    const fin = window.scrollY + el.getBoundingClientRect().bottom - window.innerHeight;
    // Sin Lenis (reduced-motion) el progreso sigue siendo el scroll: se salta sin animar.
    if (!lenisScrollTo(fin, { duration: duracion })) window.scrollTo({ top: fin, behavior: "auto" });
  }

  return (
    <div
      ref={contenedor}
      data-modo={modo}
      className="relative"
      style={{ height: alto ? `${pantallas * 100}dvh` : "100dvh" }}
    >
      <div className="sticky top-0 h-dvh overflow-hidden bg-black">
        <motion.img src={inicio} alt={alt} className={imagen} style={{ scale: escalaI }} />
        <motion.img src={llegada} alt="" aria-hidden className={imagen} style={{ scale: escalaL, opacity: opacidadL }} />
        <motion.img src={llegada} alt="" aria-hidden className={imagen} style={{ opacity: opacidadF }} />
        {modo === "clic" && (
          <button
            type="button"
            aria-label={etiqueta}
            onClick={avanzar}
            className="absolute inset-0 cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-4"
          />
        )}
      </div>
    </div>
  );
}
