"use client";

import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { type ReactNode, useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import { haLlegado } from "@/lib/scenes/progreso";
import { useAvanzarAlFinal } from "@/lib/scenes/useLenisScroll";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import {
  desplazamientoNube,
  escalaAerea,
  escalaArco,
  opacidadAerea,
  opacidadArco,
  opacidadNubes,
} from "./fases";

const AEREA = "/images/conjunto/aerea-provisional.webp";

interface IntroProps {
  textos: { entrar: string; aerea: string; pista: string; lema: string };
  /** Alto del contenedor en pantallas: cuánto scroll dura la intro. */
  pantallas?: number;
  /** Duración del avance automático tras el clic, en segundos. */
  duracion?: number;
  /** Contenido sobre la aérea (mapa del conjunto): solo visible e interactivo al llegar (§3.3). */
  children?: ReactNode;
}

// Arco andaluz de medio punto sobre columnas, con la puerta dentro (porche de las villas 4 y 5).
const TRAZOS = [
  "M14 150 V66 A46 46 0 0 1 106 66 V150",
  "M32 150 V74 A28 28 0 0 1 88 74 V150",
  "M8 66 H20 M100 66 H112",
  "M4 150 H116",
];

// Nubes provisionales hechas con gradientes CSS de borde difuso (sin filtro blur, caro al hacer scroll) (sin fotos inventadas); profundidad 1 = la más lejana.
const NUBES = [
  {
    profundidad: 1,
    fondo:
      "radial-gradient(ellipse 45% 18% at 25% 35%, rgb(255 255 255 / 0.35), transparent 85%), radial-gradient(ellipse 40% 15% at 75% 60%, rgb(255 255 255 / 0.3), transparent 85%)",
  },
  {
    profundidad: 2,
    fondo:
      "radial-gradient(ellipse 55% 22% at 65% 30%, rgb(255 255 255 / 0.45), transparent 85%), radial-gradient(ellipse 50% 20% at 20% 75%, rgb(255 255 255 / 0.4), transparent 85%)",
  },
  {
    profundidad: 3,
    fondo:
      "radial-gradient(ellipse 70% 28% at 40% 55%, rgb(255 255 255 / 0.55), transparent 85%), radial-gradient(ellipse 45% 20% at 90% 85%, rgb(255 255 255 / 0.5), transparent 85%)",
  },
];

function CapaNube({ progreso, profundidad, fondo }: { progreso: MotionValue<number>; profundidad: number; fondo: string }) {
  const y = useTransform(progreso, (p) => `${desplazamientoNube(p, profundidad)}%`);
  const scale = useTransform(progreso, (p) => 1 + 0.4 * profundidad * p);
  return (
    <motion.div
      data-nube
      aria-hidden
      className="absolute inset-x-0 -top-1/2 h-[200%]"
      style={{ y, scale, backgroundImage: fondo }}
    />
  );
}

// Intro del inicio (docs/vision.md §2.1, T1 sin vídeo §3.4): contenedor alto + hijo sticky (§3.1).
// Con la rueda avanza al ritmo del scroll; el clic en el arco desplaza solo hasta el final.
export function Intro({ textos, pantallas = 4, duracion = 4, children }: IntroProps) {
  const contenedor = useRef<HTMLDivElement>(null);
  const reducido = usePrefersReducedMotion();
  const avanzar = useAvanzarAlFinal(contenedor, duracion);
  const { scrollYProgress: progreso } = useScroll({ target: contenedor, offset: ["start start", "end end"] });
  const [llegado, setLlegado] = useState(() => haLlegado(progreso.get()));
  useMotionValueEvent(progreso, "change", (p) => setLlegado(haLlegado(p)));

  const opacidadA = useTransform(progreso, (p) => opacidadArco(p, reducido));
  const escalaA = useTransform(progreso, (p) => escalaArco(p, reducido));
  const pointerEvents = useTransform(opacidadA, (o) => (o > 0.05 ? "auto" : "none"));
  const opacidadN = useTransform(progreso, (p) => opacidadNubes(p, reducido));
  const visibilidadN = useTransform(opacidadN, (o) => (o > 0 ? "visible" : "hidden"));
  const opacidadAe = useTransform(progreso, (p) => opacidadAerea(p, reducido));
  const escalaAe = useTransform(progreso, (p) => escalaAerea(p, reducido));

  return (
    <div ref={contenedor} className="relative" style={{ height: `${pantallas * 100}dvh` }}>
      <div className="sticky top-0 h-dvh overflow-hidden bg-noche text-cal">
        <motion.img
          src={AEREA}
          alt={textos.aerea}
          className="absolute inset-0 size-full object-cover"
          style={{ opacity: opacidadAe, scale: escalaAe }}
        />
        {!reducido && (
          <motion.div className="absolute inset-0" style={{ opacity: opacidadN, visibility: visibilidadN }}>
            {NUBES.map((nube) => (
              <CapaNube key={nube.profundidad} progreso={progreso} {...nube} />
            ))}
          </motion.div>
        )}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center gap-6"
          style={{ opacity: opacidadA, scale: escalaA }}
        >
          <motion.button
            type="button"
            aria-label={textos.entrar}
            onClick={avanzar}
            className="cursor-pointer rounded-sm p-4 focus-visible:outline-2 focus-visible:outline-offset-4"
            style={{ pointerEvents }}
          >
            {/* key: al hidratar cambia reducido y el trazo se vuelve a montar para animarse. */}
            <svg
              key={String(reducido)}
              data-arco
              data-estatico={reducido}
              viewBox="0 0 120 154"
              className="h-40 w-auto sm:h-52"
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
              aria-hidden
            >
              {TRAZOS.map((d, i) => (
                <motion.path
                  key={d}
                  d={d}
                  initial={reducido ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2.4, delay: i * 0.3, ease: "easeInOut" }}
                />
              ))}
            </svg>
          </motion.button>
          <h1 className="font-display text-sm uppercase tracking-[0.35em] sm:text-base">{siteConfig.name}</h1>
          <p className="text-sm opacity-70">{textos.lema}</p>
          <p className="absolute bottom-8 text-xs uppercase tracking-[0.3em] opacity-60">{textos.pista}</p>
        </motion.div>
        {children && (
          <div
            data-llegada={llegado}
            inert={!llegado}
            className={`absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none ${
              llegado ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
