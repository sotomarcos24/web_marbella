"use client";

import { useRef, useState } from "react";
import { centroide, puntosSvg } from "@/lib/scenes/poligono";
import type { Poligono } from "@/types/villa";

export interface ZonaOverlay {
  id: string;
  /** Texto ya traducido: es el nombre visible y el aria-label. */
  nombre: string;
  poligono: Poligono;
}

interface ZonasOverlayProps {
  zonas: readonly ZonaOverlay[];
  /** Solo true cuando la transición ha llegado a su imagen fija (docs/vision.md §3.3). */
  visible: boolean;
  onSeleccion: (id: string) => void;
  /** Etiqueta de la lista alternativa para lectores de pantalla. */
  etiquetaLista: string;
}

// Zonas clicables sobre la imagen fija. El SVG 0–1 con `slice` reproduce el recorte de object-fit: cover.
// Los polígonos son el objetivo de ratón/táctil; los botones accesibles viven en una lista solo para
// lectores de pantalla y teclado (sr-only), que además resalta la zona al enfocar.
export function ZonasOverlay({ zonas, visible, onSeleccion, etiquetaLista }: ZonasOverlayProps) {
  const [activa, setActiva] = useState<string | null>(null);
  const tactil = useRef(false);

  // Al ocultarse se descarta la ficha (ajuste de estado durante el render, sin efecto).
  if (!visible && activa !== null) setActiva(null);

  const zonaActiva = zonas.find((z) => z.id === activa);

  function alPulsarPoligono(id: string) {
    // Táctil: el primer toque muestra la ficha, el segundo sobre la misma zona activa.
    if (tactil.current && activa !== id) {
      setActiva(id);
      return;
    }
    onSeleccion(id);
  }

  return (
    <div className="absolute inset-0">
      <svg
        viewBox="0 0 1 1"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
        onClick={(e) => {
          if (e.target === e.currentTarget) setActiva(null);
        }}
        className={`absolute inset-0 size-full transition-opacity duration-500 motion-reduce:transition-none ${
          visible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {zonas.map((zona) => (
          <polygon
            key={zona.id}
            points={puntosSvg(zona.poligono)}
            data-activa={activa === zona.id}
            className="cursor-pointer fill-black/0 stroke-white/0 transition-colors duration-200 data-[activa=true]:fill-black/50 data-[activa=true]:stroke-white/80"
            strokeWidth={0.003}
            onPointerDown={(e) => {
              tactil.current = e.pointerType === "touch";
            }}
            onPointerEnter={(e) => {
              if (e.pointerType !== "touch") setActiva(zona.id);
            }}
            onPointerLeave={(e) => {
              if (e.pointerType !== "touch") setActiva(null);
            }}
            onClick={() => alPulsarPoligono(zona.id)}
          />
        ))}
        {zonaActiva && (
          <text
            x={centroide(zonaActiva.poligono)[0]}
            y={centroide(zonaActiva.poligono)[1]}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={0.03}
            className="pointer-events-none fill-white"
          >
            {zonaActiva.nombre}
          </text>
        )}
      </svg>
      {visible && (
        <ul aria-label={etiquetaLista} className="sr-only">
          {zonas.map((zona) => (
            <li key={zona.id}>
              <button
                type="button"
                aria-label={zona.nombre}
                onFocus={() => setActiva(zona.id)}
                onBlur={() => setActiva(null)}
                onClick={() => onSeleccion(zona.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
