"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ScrollSequence } from "@/components/scenes/ScrollSequence";
import { Heading } from "@/components/ui/Heading";
import { cn } from "@/lib/cn";
import type { Recorrido as Tramo } from "@/types/villa";

interface RecorridoProps {
  tramos?: readonly Tramo[];
  /** Texto alternativo por URL de imagen de inicio. */
  alts: Readonly<Record<string, string>>;
}

// "Entrar en la casa" (docs/vision.md §2.5): un ScrollSequence en modo scroll por tramo (sustituto
// sin vídeo). Cada tramo termina en una foto real; el siguiente empieza en ella con el mismo encuadre.
export function Recorrido({ tramos = [], alts }: RecorridoProps) {
  const t = useTranslations();
  if (tramos.length === 0) return null;

  return (
    <section aria-label={t("recorrido.seccion")} className="bg-noche">
      {tramos.map((tramo) => (
        <TramoRecorrido key={tramo.id} tramo={tramo} alt={alts[tramo.inicio] ?? ""} titular={tramo.titularKey && t(tramo.titularKey)} />
      ))}
    </section>
  );
}

function TramoRecorrido({ tramo, alt, titular }: { tramo: Tramo; alt: string; titular?: string }) {
  const [llegado, setLlegado] = useState(false);
  return (
    <ScrollSequence
      inicio={tramo.inicio}
      llegada={tramo.imagenFinal}
      alt={alt}
      etiqueta={alt}
      encuadre={tramo.encuadre}
      onLlegada={() => setLlegado(true)}
    >
      {titular && (
        <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-noche/60 to-transparent p-6 md:p-12">
          <Heading
            level={2}
            size="display"
            className={cn(
              "text-cal transition-opacity duration-1000 motion-reduce:transition-none",
              llegado ? "opacity-100" : "opacity-0",
            )}
          >
            {titular}
          </Heading>
        </div>
      )}
    </ScrollSequence>
  );
}
