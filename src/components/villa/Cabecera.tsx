"use client";

import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { ZonasOverlay } from "@/components/scenes/ZonasOverlay";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { useRouter } from "@/i18n/navigation";
import type { VillaId, Zona } from "@/types/villa";
import { Galeria, type GrupoGaleria } from "./Galeria";

interface CabeceraProps {
  id: VillaId;
  imagenDia: string;
  /** Solo si existe con el mismo encuadre que `imagenDia`. */
  imagenNoche?: string;
  zonas: readonly Zona[];
  /** Fotos por exterior o estancia (id = `Zona.destino` de las zonas de galería), con su alt ya traducido. */
  fotos: readonly GrupoGaleria[];
}

// Cabecera de la página de villa (docs/vision.md §2.3). La página arranca ya en la imagen fija,
// así que las zonas son visibles desde el principio.
export function Cabecera({ id, imagenDia, imagenNoche, zonas, fotos }: CabeceraProps) {
  const t = useTranslations("VillaPage");
  const tZonas = useTranslations("zonas");
  const router = useRouter();
  const [noche, setNoche] = useState(false);
  const [galeria, setGaleria] = useState<{ grupo?: string } | null>(null);
  const cerrar = useCallback(() => setGaleria(null), []);

  const nombreZona = (zona: Zona) => (tZonas.has(zona.id) ? tZonas(zona.id) : zona.nombre);
  const grupos = useMemo(
    () => fotos.map((grupo) => ({ ...grupo, nombre: tZonas.has(grupo.id) ? tZonas(grupo.id) : grupo.nombre })),
    [fotos, tZonas],
  );
  const hayFotos = fotos.some((grupo) => grupo.fotos.length > 0);

  function alSeleccionar(zonaId: string) {
    const zona = zonas.find((z) => z.id === zonaId);
    if (!zona) return;
    if (zona.accion === "galeria") {
      if (fotos.some((g) => g.id === zona.destino && g.fotos.length > 0)) setGaleria({ grupo: zona.destino });
    } else {
      router.push(`/villas/${id}?planta=${zona.destino}#plano`);
    }
  }

  return (
    <header className="relative h-svh w-full overflow-hidden bg-noche">
      {/* eslint-disable-next-line @next/next/no-img-element -- imagen de cabecera local, ya en WebP */}
      <img src={noche && imagenNoche ? imagenNoche : imagenDia} alt="" className="absolute inset-0 size-full object-cover" />
      <ZonasOverlay
        zonas={zonas.map((zona) => ({ id: zona.id, nombre: nombreZona(zona), poligono: zona.poligono }))}
        visible
        onSeleccion={alSeleccionar}
        etiquetaLista={t("zonasEtiqueta")}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 p-6">
        <Heading level={1} className="text-cal">
          {t("nombre", { numero: id.replace("villa-", "") })}
        </Heading>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-3 p-6">
        <Button tone="dark" onClick={() => setGaleria({})} disabled={!hayFotos}>
          {t("verTodas")}
        </Button>
        {imagenNoche && (
          <Button tone="dark" variant="secondary" onClick={() => setNoche((n) => !n)}>
            {noche ? t("dia") : t("noche")}
          </Button>
        )}
      </div>
      {galeria && <Galeria grupos={grupos} grupoInicial={galeria.grupo} onCerrar={cerrar} />}
    </header>
  );
}
