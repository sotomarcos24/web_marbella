import type { VillaId } from "@/types/villa";

export interface CategoriaComodidades {
  id: string;
  items: readonly string[];
}

// Fuente: fichas holidayfuture (docs/fuentes/), curadas a mano: sin servicios, normas ni etiquetas genéricas.
// Los ids son claves de `comodidades.items` en messages.
const comunes: readonly CategoriaComodidades[] = [
  { id: "exterior", items: ["piscina-climatizada", "tumbonas", "comedor-exterior", "barbacoa", "jardin", "iluminacion-exterior", "parking-privado"] },
  { id: "cocina", items: ["cocina-equipada", "lavavajillas", "horno-microondas", "nevera-congelador", "cafetera", "tostadora-batidora", "menaje-grupos", "comedor-interior"] },
  { id: "dormitorios", items: ["ropa-cama-toallas", "almohadas-mantas", "persianas-opacas", "armarios-perchas"] },
  { id: "banos", items: ["ducha-banera", "bide", "secador", "gel-champu"] },
  { id: "confort", items: ["aire-acondicionado", "calefaccion", "chimenea", "lavadora-secadora", "plancha", "tendedero"] },
  { id: "entretenimiento", items: ["wifi", "smart-tv", "sonido", "zona-trabajo"] },
  { id: "seguridad", items: ["caja-fuerte", "botiquin-extintor"] },
  { id: "ninos", items: ["cuna", "trona", "puertas-seguridad", "juegos-exterior"] },
];

type Extras = Readonly<Record<string, readonly string[]>>;

// Añade `extras[categoria]` al final de cada categoría común.
const con = (extras: Extras): readonly CategoriaComodidades[] =>
  comunes.map((c) => ({ ...c, items: [...c.items, ...(extras[c.id] ?? [])] }));

// Villas 3, 4 y 5: garaje, isla de cocina, ventiladores y TV por cable (ficha).
const extras345: Extras = {
  exterior: ["garaje"],
  cocina: ["isla-cocina"],
  confort: ["ventiladores"],
  entretenimiento: ["tv-cable"],
};
const villa45: Extras = { ...extras345, seguridad: ["alarma"] };

export const comodidades: Record<VillaId, readonly CategoriaComodidades[]> = {
  "villa-1": con({ seguridad: ["alarma", "detectores"], entretenimiento: ["piano"] }),
  "villa-3": con(extras345),
  "villa-4": con(villa45),
  "villa-5": con(villa45),
};
