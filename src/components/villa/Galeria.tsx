"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

export interface FotoGaleria {
  src: string;
  alt: string;
}

export interface GrupoGaleria {
  id: string;
  nombre: string;
  /** La primera es la principal del grupo. */
  fotos: readonly FotoGaleria[];
}

interface GaleriaProps {
  grupos: readonly GrupoGaleria[];
  /** Grupo en cuya foto principal se abre; por defecto, el primero. */
  grupoInicial?: string;
  onCerrar: () => void;
}

const FOCALIZABLES = "button:not([disabled]), [href], [tabindex]:not([tabindex='-1'])";

// Galería a pantalla completa: fotos agrupadas por estancia o exterior, en orden, con pestañas,
// flechas, contador, Escape para cerrar y el foco atrapado dentro del diálogo.
export function Galeria({ grupos, grupoInicial, onCerrar }: GaleriaProps) {
  const t = useTranslations("VillaPage.galeria");
  const dialogo = useRef<HTMLDivElement>(null);
  const lista = useMemo(
    () => grupos.flatMap((grupo) => grupo.fotos.map((foto) => ({ ...foto, grupo: grupo.id }))),
    [grupos],
  );
  const gruposConFotos = useMemo(() => grupos.filter((g) => g.fotos.length > 0), [grupos]);
  const [indice, setIndice] = useState(() => Math.max(0, lista.findIndex((f) => f.grupo === grupoInicial)));
  const total = lista.length;
  const mover = useCallback((paso: number) => setIndice((i) => (i + paso + total) % total), [total]);
  const irAGrupo = (id: string) => setIndice(lista.findIndex((f) => f.grupo === id));

  useEffect(() => {
    const previo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogo.current?.querySelector<HTMLElement>(FOCALIZABLES)?.focus();
    return () => previo?.focus();
  }, []);

  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
      else if (e.key === "ArrowRight") mover(1);
      else if (e.key === "ArrowLeft") mover(-1);
      else if (e.key === "Tab") {
        const elementos = dialogo.current?.querySelectorAll<HTMLElement>(FOCALIZABLES);
        if (!elementos?.length) return;
        const primero = elementos[0]!;
        const ultimo = elementos[elementos.length - 1]!;
        const activo = document.activeElement;
        if (!dialogo.current?.contains(activo) || (e.shiftKey && activo === primero)) {
          e.preventDefault();
          (e.shiftKey ? ultimo : primero).focus();
        } else if (!e.shiftKey && activo === ultimo) {
          e.preventDefault();
          primero.focus();
        }
      }
    };
    document.addEventListener("keydown", alPulsar);
    return () => document.removeEventListener("keydown", alPulsar);
  }, [onCerrar, mover]);

  const foto = lista[indice];
  if (!foto) return null;
  return (
    <div ref={dialogo} role="dialog" aria-modal="true" aria-label={t("titulo")} className="fixed inset-0 z-50 flex flex-col bg-noche text-cal">
      <div className="flex items-center justify-between gap-4 p-4">
        <p>{t("contador", { actual: indice + 1, total })}</p>
        <Button tone="dark" variant="secondary" onClick={onCerrar}>
          {t("cerrar")}
        </Button>
      </div>
      <div role="tablist" aria-label={t("grupos")} className="flex gap-2 overflow-x-auto px-4">
        {gruposConFotos.map((grupo) => {
          const activo = grupo.id === foto.grupo;
          return (
            <Button
              key={grupo.id}
              role="tab"
              aria-selected={activo}
              tone="dark"
              variant={activo ? "primary" : "secondary"}
              onClick={() => irAGrupo(grupo.id)}
            >
              {grupo.nombre}
            </Button>
          );
        })}
      </div>
      <div className="relative min-h-0 flex-1">
        {/* eslint-disable-next-line @next/next/no-img-element -- galería de fotos locales ya optimizadas (WebP) */}
        <img src={foto.src} alt={foto.alt} className="size-full object-contain" />
      </div>
      <div className="flex justify-center gap-4 p-4">
        <Button tone="dark" onClick={() => mover(-1)}>
          {t("anterior")}
        </Button>
        <Button tone="dark" onClick={() => mover(1)}>
          {t("siguiente")}
        </Button>
      </div>
    </div>
  );
}
