export type Recorte = { left: number; top: number; width: number; height: number };

export type PhotosConfig = {
  villas: string[];
  webp: { quality: number; maxWidth: number };
  /** Fotos que no se publican (rótulo 5G, Guest services, mapa de distancias, cartas de bienvenida, placa con logo, personas). */
  exclusiones: { archivo: string; motivo: string }[];
  /** Se apartan sin publicar: base de la aérea limpia de la Fase 3. */
  pendientesEdicion: string[];
  /** Recorte por `<villa>/<archivo>` en coordenadas normalizadas 0–1. Inviable ⇒ foto descartada. */
  recortes: Record<string, Recorte>;
};

export const photosConfig: PhotosConfig = {
  villas: ["villa1", "villa3", "villa4", "villa5"],
  webp: { quality: 80, maxWidth: 1920 },
  // Pendiente: añadir los archivos reales al revisar imgs/ (ver docs/SPEC.md §12).
  exclusiones: [],
  pendientesEdicion: ["mapa_villas_1_3_4_5_1.jpg"],
  // Pendiente: coordenadas del sello "Heated Pool" de cada `_001`.
  recortes: {},
};
