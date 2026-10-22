import type { Poligono } from "../src/types/villa.ts";

export type Recorte = { left: number; top: number; width: number; height: number };

export const PLANTAS = ["planta-baja", "planta-alta"] as const;
export type PlantaId = (typeof PLANTAS)[number];
/** `tapar`: polígonos (0–1 sobre la imagen original) que se rellenan con el fondo antes de recortar. */
export type RecortePlanta = { recorte: Recorte; tapar?: Poligono[] };
/** `fondo`: color de relleno de `tapar` (blanco por defecto). */
export type Plano = { archivo: string; fondo?: string; plantas: Record<PlantaId, RecortePlanta> };

export type PhotosConfig = {
  villas: string[];
  webp: { quality: number; maxWidth: number };
  /** Fotos que no se publican (rótulo 5G, Guest services, mapa de distancias, cartas de bienvenida, placa con logo, personas). */
  exclusiones: { archivo: string; motivo: string }[];
  /** Se apartan sin publicar: base de la aérea limpia de la Fase 3. */
  pendientesEdicion: string[];
  /** Recorte por `<villa>/<archivo>` en coordenadas normalizadas 0–1. Inviable ⇒ foto descartada. */
  recortes: Record<string, Recorte>;
  /** Plano de cada villa: no se publica entero; `process-plans` saca una imagen por planta. */
  planos: Record<string, Plano>;
};

export const photosConfig: PhotosConfig = {
  villas: ["villa1", "villa3", "villa4", "villa5"],
  webp: { quality: 80, maxWidth: 1920 },
  // Pendiente: añadir los archivos reales al revisar imgs/ (ver docs/SPEC.md §12).
  exclusiones: [],
  pendientesEdicion: ["mapa_villas_1_3_4_5_1.jpg"],
  // Pendiente: coordenadas del sello "Heated Pool" de cada `_001`.
  recortes: {},
  // Coordenadas verificadas visualmente sobre los originales de imgs/ (sin logo, dirección ni texto legal).
  planos: {
    villa1: {
      archivo: "villa1_027_1.jpg",
      plantas: {
        "planta-baja": { recorte: { left: 0.44, top: 0.09, width: 0.445, height: 0.685 } },
        "planta-alta": { recorte: { left: 0.08, top: 0.155, width: 0.31, height: 0.405 } },
      },
    },
    villa3: {
      archivo: "villa3_029_1.jpg",
      plantas: {
        "planta-baja": { recorte: { left: 0.035, top: 0.06, width: 0.545, height: 0.72 } },
        "planta-alta": { recorte: { left: 0.575, top: 0.185, width: 0.375, height: 0.545 } },
      },
    },
    villa4: {
      archivo: "villa4_025_1.jpg",
      plantas: {
        "planta-baja": {
          recorte: { left: 0.05, top: 0.085, width: 0.78, height: 0.64 },
          tapar: [
            // Logo
            [[0.81, 0], [1, 0], [1, 0.1], [0.81, 0.1]],
            // Planta alta
            [[0.53, 0.552], [1, 0.552], [1, 1], [0.462, 1], [0.462, 0.6]],
          ],
        },
        "planta-alta": {
          recorte: { left: 0.465, top: 0.555, width: 0.445, height: 0.335 },
          // Esquina del jardín
          tapar: [[[0.4, 0.5], [0.6, 0.5], [0.535, 0.552], [0.468, 0.6], [0.4, 0.6]]],
        },
      },
    },
    villa5: {
      archivo: "villa5_024_1.jpg",
      plantas: {
        "planta-baja": {
          recorte: { left: 0.13, top: 0.08, width: 0.795, height: 0.64 },
          tapar: [
            // Logo
            [[0.81, 0], [1, 0], [1, 0.097], [0.81, 0.097]],
            // Planta alta
            [[0, 0.555], [0.44, 0.555], [0.44, 0.592], [0.525, 0.592], [0.525, 1], [0, 1]],
          ],
        },
        "planta-alta": {
          recorte: { left: 0.075, top: 0.56, width: 0.45, height: 0.33 },
          // Camino y jardín de la esquina superior derecha
          tapar: [[[0.4, 0.5], [1, 0.5], [1, 0.595], [0.4, 0.595]]],
        },
      },
    },
  },
};
