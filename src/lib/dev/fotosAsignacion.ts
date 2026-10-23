import { esObjeto } from "@/lib/dev/zonasSalida";
import type { Foto } from "@/types/foto";
import type { TipoExterior, VillaId } from "@/types/villa";

// Lógica pura de /dev/fotos. Una asignación es `destinoId → archivos`; el primero de cada lista es la foto principal.
// Una foto pertenece a un solo destino. Se guarda en `src/content/fotos/<villa>.json`.

export const EXTERIORES = ["jardin", "piscina", "porche", "barbacoa", "terraza", "patio", "parking"] as const satisfies readonly TipoExterior[];

export type Asignacion = Readonly<Record<string, readonly string[]>>;

export interface Destino {
  id: string;
  nombre: string;
  grupo: "estancia" | "exterior";
}

export interface VillaFotos {
  villa: VillaId;
  destinos: readonly Destino[];
  fotos: readonly Foto[];
  asignacion: Asignacion;
}

/** Estancias de los planos de la villa seguidas de los exteriores. */
export function destinosVilla(estancias: readonly { id: string; nombre: string }[]): Destino[] {
  return [
    ...estancias.map((e): Destino => ({ ...e, grupo: "estancia" })),
    ...EXTERIORES.map((id): Destino => ({ id, nombre: id, grupo: "exterior" })),
  ];
}

/** Destino de la foto, si está asignada. */
export const destinoDe = (asignacion: Asignacion, archivo: string): string | undefined =>
  Object.keys(asignacion).find((id) => asignacion[id]?.includes(archivo));

/** Quita la foto de donde esté; los destinos que se quedan vacíos desaparecen. */
export function quitar(asignacion: Asignacion, archivo: string): Asignacion {
  return Object.fromEntries(
    Object.entries(asignacion)
      .map(([id, lista]) => [id, lista.filter((a) => a !== archivo)] as const)
      .filter(([, lista]) => lista.length > 0),
  );
}

/** Mueve la foto al final del destino (y la quita de su destino anterior). */
export function asignar(asignacion: Asignacion, destinoId: string, archivo: string): Asignacion {
  if (asignacion[destinoId]?.includes(archivo)) return asignacion;
  const base = quitar(asignacion, archivo);
  return { ...base, [destinoId]: [...(base[destinoId] ?? []), archivo] };
}

/** Pone la foto en primera posición de su destino. */
export function marcarPrincipal(asignacion: Asignacion, destinoId: string, archivo: string): Asignacion {
  const lista = asignacion[destinoId];
  if (!lista?.includes(archivo)) return asignacion;
  return { ...asignacion, [destinoId]: [archivo, ...lista.filter((a) => a !== archivo)] };
}

/** Destino propuesto por el catálogo (solo si existe en la villa) y si la clasificación es de baja confianza. */
export function sugerencia(foto: Foto, destinos: readonly Destino[]): { destinoId: string | undefined; baja: boolean } {
  const destinoId = destinos.find((d) => d.id === foto.estanciaSugerida)?.id;
  return { destinoId, baja: foto.confianza === "baja" };
}

/** Errores de una asignación frente a los destinos y fotos de su villa; [] = válida. */
export function validarAsignacion(asignacion: Asignacion, destinos: readonly Destino[], fotos: readonly Foto[]): string[] {
  const errores: string[] = [];
  const idsDestino = new Set(destinos.map((d) => d.id));
  const archivos = new Set(fotos.map((f) => f.archivo));
  const vistas = new Set<string>();
  const repetidas = new Set<string>();
  for (const [id, lista] of Object.entries(asignacion)) {
    if (!idsDestino.has(id)) errores.push(`destino desconocido: ${id}`);
    for (const archivo of lista) {
      if (!archivos.has(archivo)) errores.push(`foto desconocida en ${id}: ${archivo}`);
      if (vistas.has(archivo)) repetidas.add(archivo);
      vistas.add(archivo);
    }
  }
  for (const archivo of repetidas) errores.push(`${archivo} está en más de un destino`);
  return errores;
}

/** Asignación si `valor` es un objeto de listas de cadenas; null si no. */
export function leerAsignacion(valor: unknown): Asignacion | null {
  if (!esObjeto(valor)) return null;
  const entradas = Object.entries(valor);
  return entradas.every(([, lista]) => Array.isArray(lista) && lista.every((a) => typeof a === "string")) ? (valor as Asignacion) : null;
}
