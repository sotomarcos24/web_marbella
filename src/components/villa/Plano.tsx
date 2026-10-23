"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Heading } from "@/components/ui/Heading";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { puntosSvg } from "@/lib/scenes/poligono";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import type { DistribucionCamas, Dormitorio, Planta, TipoEstancia } from "@/types/villa";
import { PlanoPanel } from "./PlanoPanel";

interface PlanoProps {
  plantas: readonly Planta[];
  dormitorios: readonly Dormitorio[];
  estadoCamas: DistribucionCamas["estado"];
}

// Colores suaves translúcidos de la paleta por tipo de estancia.
const relleno: Record<TipoEstancia, string> = {
  salon: "fill-arena/30 stroke-arena",
  cocina: "fill-terracota/30 stroke-terracota",
  comedor: "fill-arena/30 stroke-arena",
  dormitorio: "fill-oliva/40 stroke-oliva",
  bano: "fill-mar/40 stroke-mar",
  aseo: "fill-mar/40 stroke-mar",
  recibidor: "fill-terracota/30 stroke-terracota",
  lavanderia: "fill-mar/30 stroke-mar",
  otro: "fill-cal/20 stroke-cal",
};

const INCLINACION = "perspective(1200px) rotateX(22deg) scale(0.94)";

// Plano de planta ("Explorar la villa", docs/vision.md §2.4). La planta se sincroniza con `?planta=`.
export function Plano({ plantas, dormitorios, estadoCamas }: PlanoProps) {
  const t = useTranslations("Plano");
  const tZonas = useTranslations("zonas");
  const router = useRouter();
  const pathname = usePathname();
  const consulta = useSearchParams().get("planta");
  const reducido = usePrefersReducedMotion();

  const desdeQuery = plantas.find((p) => p.id === consulta)?.id ?? plantas[0]?.id;
  const [plantaId, setPlantaId] = useState(desdeQuery);
  const [consultaVista, setConsultaVista] = useState(consulta);
  const [abierta, setAbierta] = useState<string | null>(null);

  // La query también cambia desde fuera (zonas de la cabecera): se adopta durante el render.
  if (consulta !== consultaVista) {
    setConsultaVista(consulta);
    setPlantaId(desdeQuery);
    setAbierta(null);
  }

  useEffect(() => {
    if (!abierta) return;
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierta(null);
    };
    document.addEventListener("keydown", alPulsar);
    return () => document.removeEventListener("keydown", alPulsar);
  }, [abierta]);

  const planta = plantas.find((p) => p.id === plantaId);
  if (!planta) return null;
  const nombrePlanta = tZonas.has(planta.id) ? tZonas(planta.id) : planta.nombre;
  const estancia = planta.estancias.find((e) => e.id === abierta);

  function elegirPlanta(id: string) {
    setPlantaId(id);
    setAbierta(null);
    router.replace(`${pathname}?planta=${id}#plano`, { scroll: false });
  }

  return (
    <section id="plano" aria-labelledby="plano-titulo" className="bg-noche px-6 py-16 text-cal">
      <Heading level={2} id="plano-titulo">
        {t("titulo")}
      </Heading>
      <div role="tablist" aria-label={t("selector")} className="my-6 flex gap-3">
        {plantas.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={p.id === planta.id}
            onClick={() => elegirPlanta(p.id)}
            className={cn(
              "border border-cal px-5 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cal",
              p.id === planta.id ? "bg-cal text-noche" : "text-cal hover:bg-cal/10",
            )}
          >
            {tZonas.has(p.id) ? tZonas(p.id) : p.nombre}
          </button>
        ))}
      </div>
      <div className={cn("grid gap-6", estancia && "lg:grid-cols-[minmax(0,1fr)_24rem]")}>
        <div>
          <div
            data-testid="plano-inclinable"
            className="relative"
            style={{
              transform: estancia && !reducido ? INCLINACION : undefined,
              transition: reducido ? undefined : "transform 700ms ease",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- plano local ya en WebP */}
            <img src={planta.imagenPlano} alt={t("planoAlt", { planta: nombrePlanta })} className="block h-auto w-full" />
            <svg viewBox="0 0 1 1" preserveAspectRatio="none" role="group" aria-label={t("estancias")} className="absolute inset-0 size-full">
              {planta.estancias.map((e) => (
                <polygon
                  key={e.id}
                  points={puntosSvg(e.poligono)}
                  role="button"
                  tabIndex={0}
                  aria-label={e.nombre}
                  aria-pressed={e.id === abierta}
                  strokeWidth={0.003}
                  onClick={() => setAbierta(e.id)}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter" || ev.key === " ") {
                      ev.preventDefault();
                      setAbierta(e.id);
                    }
                  }}
                  className={cn(
                    "cursor-pointer transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:stroke-cal",
                    relleno[e.tipo],
                    e.id === abierta && "opacity-100 stroke-cal",
                  )}
                />
              ))}
            </svg>
          </div>
        </div>
        {estancia && (
          <PlanoPanel
            key={estancia.id}
            estancia={estancia}
            dormitorio={dormitorios.find((d) => d.id === estancia.id)}
            estadoCamas={estadoCamas}
            onCerrar={() => setAbierta(null)}
          />
        )}
      </div>
    </section>
  );
}
