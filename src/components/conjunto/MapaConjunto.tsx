"use client";

import { useTranslations } from "next-intl";
import { type PointerEvent, useRef, useState } from "react";
import { ScrollSequence } from "@/components/scenes/ScrollSequence";
import { useRouter } from "@/i18n/navigation";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { puntosSvg } from "@/lib/scenes/poligono";
import type { VillaId } from "@/types/villa";
import type { FichaVilla } from "./fichas";
import { MiniFicha } from "./MiniFicha";

interface MapaConjuntoProps {
  /** Aérea limpia: la imagen fija donde termina T1. */
  imagen: string;
  villas: readonly FichaVilla[];
  /** Duración de T2, en segundos. */
  duracion?: number;
}

const ESTADOS = {
  activa: "fill-white/15 stroke-white",
  atenuada: "fill-black/55 stroke-white/0",
  normal: "fill-black/0 stroke-white/40",
};

const ruta = (id: VillaId) => `/villas/${id}`;

// Mapa del conjunto (docs/vision.md §2.2): parcelas sobre la aérea, mini ficha al pasar el ratón o
// enfocar, dos toques en táctil y T2 (sustituto: fundido + zoom hasta la portada) antes de navegar (§3.6).
export function MapaConjunto({ imagen, villas, duracion = 2.5 }: MapaConjuntoProps) {
  const t = useTranslations("Conjunto");
  const router = useRouter();
  const reducido = usePrefersReducedMotion();
  const [activa, setActiva] = useState<VillaId | null>(null);
  const [destino, setDestino] = useState<FichaVilla | null>(null);
  // Tamaño natural de la aérea: el viewBox con `slice` reproduce así el recorte de object-fit: cover.
  const [tamano, setTamano] = useState<readonly [number, number]>([1, 1]);
  const tactil = useRef(false);
  const activaAlPulsar = useRef<VillaId | null>(null);

  const fichaActiva = villas.find((v) => v.id === activa);
  const nombre = (id: VillaId) => t("nombre", { numero: id.replace("villa-", "") });

  function medir(img: HTMLImageElement | null) {
    if (img?.naturalWidth && (img.naturalWidth !== tamano[0] || img.naturalHeight !== tamano[1])) {
      setTamano([img.naturalWidth, img.naturalHeight]);
    }
  }

  function seleccionar(villa: FichaVilla) {
    if (destino) return;
    if (reducido) {
      router.push(ruta(villa.id));
      return;
    }
    router.prefetch(ruta(villa.id));
    setDestino(villa);
  }

  // El estado se captura al empezar el toque: el foco que lo acompaña no cuenta como primer toque.
  function alEmpezar(e: PointerEvent) {
    tactil.current = e.pointerType === "touch";
    activaAlPulsar.current = activa;
  }

  function alPulsar(villa: FichaVilla) {
    const toque = tactil.current;
    tactil.current = false; // un Enter posterior no hereda el toque
    if (toque && activaAlPulsar.current !== villa.id) {
      setActiva(villa.id);
      return;
    }
    seleccionar(villa);
  }

  const hover = (id: VillaId | null) => (e: PointerEvent) => {
    if (e.pointerType !== "touch") setActiva(id);
  };

  // Mismos gestos en la parcela y en su botón de la lista.
  const gestos = (villa: FichaVilla) => ({
    onPointerDown: alEmpezar,
    onPointerEnter: hover(villa.id),
    onPointerLeave: hover(null),
    onClick: () => alPulsar(villa),
  });

  return (
    <div className="absolute inset-0">
      {/* eslint-disable-next-line @next/next/no-img-element -- aérea local ya en WebP, la misma que la intro */}
      <img ref={medir} src={imagen} alt="" onLoad={(e) => medir(e.currentTarget)} className="absolute inset-0 size-full object-cover" />
      <svg
        viewBox={`0 0 ${tamano[0]} ${tamano[1]}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
        className="absolute inset-0 size-full"
      >
        {villas.map((villa) => {
          const estado = activa === null ? "normal" : activa === villa.id ? "activa" : "atenuada";
          return (
            <polygon
              key={villa.id}
              data-villa={villa.id}
              data-estado={estado}
              points={puntosSvg(villa.poligono, tamano)}
              vectorEffect="non-scaling-stroke"
              strokeWidth={1.5}
              className={`cursor-pointer transition-colors duration-300 motion-reduce:transition-none ${ESTADOS[estado]}`}
              {...gestos(villa)}
            />
          );
        })}
      </svg>
      <div role="status" className="pointer-events-none absolute top-20 left-6">
        {fichaActiva && <MiniFicha ficha={fichaActiva} />}
      </div>
      <ul aria-label={t("lista")} className="absolute inset-x-0 bottom-0 flex flex-wrap justify-center gap-3 p-6">
        {villas.map((villa) => (
          <li key={villa.id}>
            <button
              type="button"
              aria-pressed={activa === villa.id}
              {...gestos(villa)}
              onFocus={() => setActiva(villa.id)}
              onBlur={() => setActiva(null)}
              className="rounded-full border border-cal/70 bg-noche/60 px-4 py-2 text-sm text-cal transition-colors hover:bg-cal hover:text-noche focus-visible:outline-2 focus-visible:outline-offset-2 aria-pressed:bg-cal aria-pressed:text-noche"
            >
              {nombre(villa.id)}
            </button>
          </li>
        ))}
      </ul>
      {destino && (
        <div className="fixed inset-0 z-30">
          <ScrollSequence
            inicio={imagen}
            llegada={destino.portada}
            alt=""
            etiqueta={nombre(destino.id)}
            modo="clic"
            autoplay
            duracion={duracion}
            onLlegada={() => router.push(ruta(destino.id))}
          />
        </div>
      )}
    </div>
  );
}
