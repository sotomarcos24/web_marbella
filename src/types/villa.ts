// Modelo de datos de las villas (SPEC §5 y docs/vision.md §3.7).
// Los campos `nombre` y `titularKey` son claves de traducción de `src/messages/*.json`, no textos.

export type VillaId = "villa-1" | "villa-3" | "villa-4" | "villa-5";

/** Vértice [x, y] en coordenadas normalizadas 0–1 sobre su imagen (origen arriba a la izquierda). */
export type Punto = readonly [x: number, y: number];

/** Polígono cerrado implícitamente (el último vértice se une con el primero); mínimo 3 vértices. */
export type Poligono = readonly Punto[];

/** Zona interactiva de la cabecera. `destino`: id de exterior o estancia ("galeria") o id de planta ("planta"). */
export interface Zona {
  id: string;
  nombre: string;
  poligono: Poligono;
  accion: "galeria" | "planta";
  destino: string;
}

export type TipoEstancia = "salon" | "cocina" | "comedor" | "dormitorio" | "bano" | "aseo" | "recibidor" | "lavanderia" | "otro";

export type TipoCama = "doble" | "individual" | "litera" | "sofa-cama";

export interface Camas {
  tipo: TipoCama;
  cantidad: number;
}

export interface Estancia {
  id: string;
  nombre: string;
  tipo: TipoEstancia;
  poligono: Poligono;
  /** Rutas bajo `public/`; la primera es la principal. */
  fotos: readonly string[];
  camas?: readonly Camas[];
  banoEnSuite?: boolean;
  /** Medidas tal como aparecen en el plano, p. ej. "4,2 × 3,8 m". */
  medidas?: string;
}

export interface Planta {
  id: string;
  nombre: string;
  imagenPlano: string;
  estancias: readonly Estancia[];
}

export type TipoExterior = "jardin" | "piscina" | "porche" | "barbacoa" | "terraza" | "patio" | "parking";

export interface Exterior {
  id: TipoExterior;
  fotos: readonly string[];
}

export interface Hero {
  imagenDia: string;
  imagenNoche?: string;
  /** Vídeo en bucle con cámara fija: mismas zonas que la imagen. */
  video?: string;
  zonas: readonly Zona[];
  /** Fase 2: id de la transición (T2) que termina en `imagenDia`. */
  transicionEntrada?: string;
}

/** Fase 2: tramo de la secuencia "entrar en la casa" (T3, T4). */
export interface Recorrido {
  id: string;
  /** Id de la transición en `src/content/transiciones.json`. */
  transicion: string;
  /** Foto real fija en la que termina la transición. */
  imagenFinal: string;
  titularKey?: string;
}

/** Fase 2: aérea del conjunto con la parcela de cada villa. */
export interface Conjunto {
  imagen: string;
  parcelas: readonly { villaId: VillaId; poligono: Poligono }[];
}

/** Dato pendiente de confirmar: nunca se inventa; se marca aquí. */
export interface Pendiente {
  campo: string;
  nota: string;
}

export interface Villa {
  id: VillaId;
  /** Tope legal andaluz, igual en todas. */
  plazasMax: 15;
  /** Cifras de la ficha (SPEC §6), no se derivan de los planos: pueden no coincidir (villa-1). */
  dormitorios: number;
  banos: number;
  superficieVivienda: number;
  superficieParcela: number;
  /** Plazas de aparcamiento. */
  parking: number;
  combinableCon?: readonly VillaId[];
  /** Vacíos hasta tenerlos (ver `pendientes`). */
  inscripcionTuristica?: string;
  coordenadas?: { lat: number; lng: number };
  pendientes: readonly Pendiente[];
  hero: Hero;
  plantas: readonly Planta[];
  exteriores: readonly Exterior[];
  /** Fase 2. */
  recorrido?: readonly Recorrido[];
  /** Fase 2: ids de estancias para las tarjetas en arco. */
  destacadas?: readonly string[];
}
