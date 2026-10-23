"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import type { Dormitorio, DistribucionCamas, Estancia } from "@/types/villa";

interface PlanoPanelProps {
  estancia: Estancia;
  /** Ficha de camas de esta estancia, si es un dormitorio de la ficha. */
  dormitorio?: Dormitorio;
  estadoCamas: DistribucionCamas["estado"];
  onCerrar: () => void;
}

// Panel lateral de una estancia: tipo, camas, baño en suite, medidas y carrusel de fotos.
export function PlanoPanel({ estancia, dormitorio, estadoCamas, onCerrar }: PlanoPanelProps) {
  const t = useTranslations("Plano");
  const [indice, setIndice] = useState(0);
  const total = estancia.fotos.length;
  const mover = (paso: number) => setIndice((i) => (i + paso + total) % total);

  const camas = estancia.camas ?? dormitorio?.camas;
  const banoEnSuite = estancia.banoEnSuite ?? dormitorio?.banoEnSuite;
  const esDormitorio = estancia.tipo === "dormitorio";

  return (
    <aside aria-label={estancia.nombre} className="flex flex-col gap-4 bg-noche/60 p-6 text-cal ring-1 ring-cal/20">
      <Button tone="dark" variant="ghost" onClick={onCerrar} className="self-start">
        {t("volver")}
      </Button>
      <div>
        <p className="text-sm uppercase tracking-widest text-arena">{t(`tipos.${estancia.tipo}`)}</p>
        <Heading level={2} size="md">
          {estancia.nombre}
        </Heading>
      </div>
      {estancia.medidas && <p>{t("medidas", { medidas: estancia.medidas })}</p>}
      {esDormitorio && (
        <section aria-label={t("camasTitulo")}>
          {camas && camas.length > 0 ? (
            <ul>
              {camas.map((cama) => (
                <li key={cama.tipo}>{t(`camas.${cama.tipo}`, { cantidad: cama.cantidad })}</li>
              ))}
            </ul>
          ) : (
            <p>{t("sinCamas")}</p>
          )}
          {estadoCamas === "pendiente de confirmar" && <p className="text-sm text-arena">{t("camasPendientes")}</p>}
        </section>
      )}
      {banoEnSuite && <p>{t("banoEnSuite")}</p>}
      {total > 0 ? (
        <div className="flex flex-col gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- fotos locales ya optimizadas (WebP) */}
          <img
            src={estancia.fotos[indice]}
            alt={t("fotoAlt", { estancia: estancia.nombre, actual: indice + 1, total })}
            className="aspect-[4/3] w-full object-cover"
          />
          {total > 1 && (
            <div className="flex items-center justify-between">
              <Button tone="dark" variant="secondary" onClick={() => mover(-1)}>
                {t("anterior")}
              </Button>
              <span>{t("contador", { actual: indice + 1, total })}</span>
              <Button tone="dark" variant="secondary" onClick={() => mover(1)}>
                {t("siguiente")}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-arena">{t("sinFotos")}</p>
      )}
    </aside>
  );
}
