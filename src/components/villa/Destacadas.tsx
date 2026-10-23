"use client";

import { AnimatePresence, MotionConfig, motion, type Variants } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";

interface Tarjeta {
  /** Id de la estancia o exterior (clave de `VillaPage.destacadas.estancias`). */
  id: string;
  /** Nombre del contenido, si no hay traducción propia. */
  nombre: string;
  foto: string;
}

interface DestacadasProps {
  tarjetas: readonly Tarjeta[];
}

const lista: Variants = { visible: { transition: { staggerChildren: 0.12 } } };
const entrada: Variants = {
  oculta: { opacity: 0, y: 48 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

// "Dentro de la villa" (docs/vision.md §2.6): tarjetas en arco que se abren a pantalla completa
// con una animación de layout compartida (layoutId) entre la tarjeta y la vista abierta.
export function Destacadas({ tarjetas }: DestacadasProps) {
  const t = useTranslations("VillaPage.destacadas");
  const tituloId = useId();
  const [abierta, setAbierta] = useState<string | null>(null);
  // Tarjeta que abrió la vista: recupera el foco al cerrar.
  const origen = useRef<HTMLButtonElement | null>(null);

  const texto = (id: string, campo: "nombre" | "frase") => {
    const clave = `estancias.${id}.${campo}`;
    return t.has(clave) ? t(clave) : null;
  };
  const nombre = (tarjeta: Tarjeta) => texto(tarjeta.id, "nombre") ?? tarjeta.nombre;
  const actual = tarjetas.find((tarjeta) => tarjeta.id === abierta);

  useEffect(() => {
    if (!abierta) return;
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierta(null);
    };
    document.addEventListener("keydown", alPulsar);
    return () => document.removeEventListener("keydown", alPulsar);
  }, [abierta]);

  if (tarjetas.length === 0) return null;

  return (
    <MotionConfig reducedMotion="user">
      <section aria-labelledby={tituloId} className="bg-cal px-6 py-24 text-tinta">
        <Heading id={tituloId} level={2} size="xl" className="mb-12 text-center">
          {t("titulo")}
        </Heading>
        <motion.ul
          className="mx-auto grid max-w-6xl grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5"
          variants={lista}
          initial="oculta"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {tarjetas.map((tarjeta) => (
            <motion.li key={tarjeta.id} variants={entrada}>
              <button
                type="button"
                onClick={(e) => {
                  origen.current = e.currentTarget;
                  setAbierta(tarjeta.id);
                }}
                className={cn("group block w-full text-left focus-visible:outline-offset-4", focusRing)}
              >
                <motion.div
                  layoutId={`destacada-${tarjeta.id}`}
                  data-arco
                  className="aspect-[3/4] overflow-hidden rounded-t-full"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- fotos locales ya en WebP */}
                  <img
                    src={tarjeta.foto}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </motion.div>
                <span className="mt-3 block font-display text-heading-md">
                  {nombre(tarjeta)}
                </span>
              </button>
            </motion.li>
          ))}
        </motion.ul>
      </section>
      <AnimatePresence onExitComplete={() => origen.current?.focus()}>
        {actual && (
          <Abierta
            key={actual.id}
            id={actual.id}
            foto={actual.foto}
            nombre={nombre(actual)}
            frase={texto(actual.id, "frase")}
            cerrar={t("cerrar")}
            onCerrar={() => setAbierta(null)}
          />
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}

interface AbiertaProps {
  id: string;
  foto: string;
  nombre: string;
  frase: string | null;
  cerrar: string;
  onCerrar: () => void;
}

function Abierta({ id, foto, nombre, frase, cerrar, onCerrar }: AbiertaProps) {
  const cerrarRef = useRef<HTMLButtonElement>(null);
  useEffect(() => cerrarRef.current?.focus(), []);

  return (
    <div role="dialog" aria-modal="true" aria-label={nombre} className="fixed inset-0 z-50 text-cal">
      <motion.div layoutId={`destacada-${id}`} className="absolute inset-0 overflow-hidden bg-noche">
        {/* eslint-disable-next-line @next/next/no-img-element -- fotos locales ya en WebP */}
        <img src={foto} alt="" className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-noche/80 via-noche/10 to-transparent" />
      </motion.div>
      <motion.div
        className="absolute inset-x-0 bottom-0 p-6 md:p-12"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.5 } }}
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
      >
        <Heading level={2} size="display">
          {nombre}
        </Heading>
        {frase && <p className="mt-4 max-w-xl text-lg">{frase}</p>}
      </motion.div>
      <div className="absolute top-0 right-0 p-4">
        <Button ref={cerrarRef} tone="dark" variant="secondary" onClick={onCerrar}>
          {cerrar}
        </Button>
      </div>
    </div>
  );
}
