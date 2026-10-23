import type { Poligono } from "../src/types/villa.ts";

export type Recorte = { left: number; top: number; width: number; height: number };
/** Tapa `zona` con una copia del mismo tamaño tomada en `origen` (esquina superior izquierda), todo en 0–1. */
export type Retoque = { zona: Recorte; origen: { left: number; top: number } };

export const PLANTAS = ["planta-baja", "planta-alta"] as const;
export type PlantaId = (typeof PLANTAS)[number];
/** `tapar`: polígonos (0–1 sobre la imagen original) que se rellenan con el fondo antes de recortar. */
export type RecortePlanta = { recorte: Recorte; tapar?: Poligono[] };
/** `fondo`: color de relleno de `tapar` (blanco por defecto). */
export type Plano = { archivo: string; fondo?: string; plantas: Record<PlantaId, RecortePlanta> };

/** Carpeta de `imgs/` (`villa1`) → carpeta pública con el id de `VillaId` (`villa-1`). */
export const carpetaPublica = (villa: string) => villa.replace(/^villa(\d+)$/, "villa-$1");
/** Nombre del WebP publicado a partir del JPG original. */
export const aWebp = (archivo: string) => archivo.replace(/\.jpe?g$/i, ".webp");

export type PhotosConfig = {
  villas: string[];
  webp: { quality: number; maxWidth: number };
  /** Fotos que no se publican (rótulo 5G, Guest services, mapa de distancias, cartas de bienvenida, placa con logo, personas). */
  exclusiones: { archivo: string; motivo: string }[];
  /** Se apartan sin publicar: base de la aérea limpia de la Fase 3. */
  pendientesEdicion: string[];
  /** Recorte por `<villa>/<archivo>` en coordenadas normalizadas 0–1. Inviable ⇒ foto descartada. */
  recortes: Record<string, Recorte>;
  /** Retoques por `<villa>/<archivo>`, antes del recorte. Inviable ⇒ foto descartada. */
  retoques?: Record<string, Retoque[]>;
  /** Plano de cada villa: no se publica entero; `process-plans` saca una imagen por planta. */
  planos: Record<string, Plano>;
};

export const photosConfig: PhotosConfig = {
  villas: ["villa1", "villa3", "villa4", "villa5"],
  webp: { quality: 80, maxWidth: 1920 },
  // Revisadas en #15 (ver docs/fotos-resumen.md). "retocable": se podría recuperar borrando la tarjeta.
  exclusiones: [
    { archivo: "villa1_005.jpg", motivo: "tarjeta de bienvenida con texto/logo sobre la cama (pequeña; retocable)" },
    { archivo: "villa1_007.jpg", motivo: "tarjeta de bienvenida con texto/logo sobre la cama (pequeña; retocable)" },
    { archivo: "villa1_009_1.jpg", motivo: "mapa de ubicación con distancias y rótulo de marca" },
    { archivo: "villa1_018_1.jpg", motivo: "rótulo 5G y logo de marca" },
    { archivo: "villa1_021_1.jpg", motivo: "cartel Guest services y logo de marca" },
    { archivo: "villa1_022.jpg", motivo: "tarjeta de bienvenida con texto/logo sobre la cama (pequeña; retocable)" },
    { archivo: "villa1_024.jpg", motivo: "tarjeta de bienvenida con texto/logo sobre la cama" },
    { archivo: "villa1_039.jpg", motivo: "duplicado exacto de villa1_012" },
    { archivo: "villa1_046.jpg", motivo: "tarjeta de bienvenida con texto/logo sobre la cama (pequeña; retocable)" },
    { archivo: "villa1_047.jpg", motivo: "carta de bienvenida con logo de marca" },
    { archivo: "villa1_048.jpg", motivo: "tarjeta de bienvenida con texto/logo sobre la cama (pequeña; retocable)" },
    { archivo: "villa1_056.jpg", motivo: "tarjeta de bienvenida con texto/logo sobre la cama (pequeña; retocable)" },
    { archivo: "villa1_065.jpg", motivo: "carta de bienvenida con logo de marca" },
    { archivo: "villa3_007_1.jpg", motivo: "mapa de ubicación con distancias y nombre de marca" },
    { archivo: "villa3_017_1.jpg", motivo: "cartel Guest services con logo de marca" },
    { archivo: "villa3_023_1.jpg", motivo: "rótulo 5G con logo de marca" },
    { archivo: "villa4_005_1.jpg", motivo: "mapa de ubicación con distancias y nombre de marca" },
    { archivo: "villa4_013_1.jpg", motivo: "rótulo 5G con logo de marca" },
    { archivo: "villa4_020_1.jpg", motivo: "cartel Guest services con logo de marca" },
    { archivo: "villa4_041.jpg", motivo: "carta de bienvenida con logo de marca" },
    { archivo: "villa4_061.jpg", motivo: "carta de bienvenida con marca y datos de contacto" },
    { archivo: "villa4_067.jpg", motivo: "carta de bienvenida con logo sobre la consola" },
    { archivo: "villa5_007.jpg", motivo: "tarjeta de bienvenida con logo sobre las toallas (retocable)" },
    { archivo: "villa5_010_1.jpg", motivo: "mapa de ubicación con distancias y nombre de marca" },
    { archivo: "villa5_013_1.jpg", motivo: "cartel Guest services con logo de marca" },
    { archivo: "villa5_014.jpg", motivo: "tarjeta de bienvenida con logo sobre las toallas (retocable)" },
    { archivo: "villa5_016.jpg", motivo: "tarjeta de bienvenida con logo sobre las toallas (retocable)" },
    { archivo: "villa5_020_1.jpg", motivo: "rótulo 5G con logo de marca" },
    { archivo: "villa5_038.jpg", motivo: "tarjeta de bienvenida con logo sobre las toallas (retocable)" },
    { archivo: "villa5_051.jpg", motivo: "tarjeta de bienvenida con logo sobre las toallas (retocable)" },
    { archivo: "villa5_054.jpg", motivo: "tarjeta de bienvenida con logo sobre las toallas (retocable)" },
  ],
  pendientesEdicion: ["mapa_villas_1_3_4_5_1.jpg"],
  // Sello "Heated Pool" abajo a la derecha de cada `_001`: se recorta la franja inferior entera.
  recortes: {
    "villa1/villa1_001.jpg": { left: 0, top: 0, width: 1, height: 0.835 },
    "villa3/villa3_001.jpg": { left: 0, top: 0, width: 1, height: 0.8 },
    "villa4/villa4_001.jpg": { left: 0, top: 0, width: 1, height: 0.8 },
    "villa5/villa5_001.jpg": { left: 0, top: 0, width: 1, height: 0.79 },
  },
  // Placa con logo y número de villa en la puerta: se tapa con la madera de debajo (mismos tablones).
  retoques: {
    "villa4/villa4_078.jpg": [{ zona: { left: 0.345, top: 0.381, width: 0.088, height: 0.062 }, origen: { left: 0.345, top: 0.455 } }],
  },
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
