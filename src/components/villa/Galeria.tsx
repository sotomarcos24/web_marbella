"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

interface GaleriaProps {
  fotos: readonly string[];
  onCerrar: () => void;
}

// Galería a pantalla completa: una foto cada vez, con flechas, contador y Escape para cerrar.
export function Galeria({ fotos, onCerrar }: GaleriaProps) {
  const t = useTranslations("VillaPage.galeria");
  const [indice, setIndice] = useState(0);
  const total = fotos.length;
  const mover = useCallback((paso: number) => setIndice((i) => (i + paso + total) % total), [total]);

  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
      else if (e.key === "ArrowRight") mover(1);
      else if (e.key === "ArrowLeft") mover(-1);
    };
    document.addEventListener("keydown", alPulsar);
    return () => document.removeEventListener("keydown", alPulsar);
  }, [onCerrar, mover]);

  const actual = indice + 1;
  return (
    <div role="dialog" aria-modal="true" aria-label={t("titulo")} className="fixed inset-0 z-50 flex flex-col bg-noche text-cal">
      <div className="flex items-center justify-between p-4">
        <p>{t("contador", { actual, total })}</p>
        <Button tone="dark" variant="secondary" onClick={onCerrar}>
          {t("cerrar")}
        </Button>
      </div>
      <div className="relative min-h-0 flex-1">
        {/* eslint-disable-next-line @next/next/no-img-element -- galería de fotos locales ya optimizadas (WebP) */}
        <img src={fotos[indice]} alt={t("alt", { actual, total })} className="size-full object-contain" />
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
