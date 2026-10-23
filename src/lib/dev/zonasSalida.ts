import type { PoligonoEditable } from "@/lib/dev/polygon";
import { validarConjunto, validarVilla, validarZonas } from "@/lib/validation/villa";
import { ACCIONES_ZONA, TIPOS_ESTANCIA, type Conjunto, type Estancia, type Poligono, type Villa, type VillaId, type Zona } from "@/types/villa";

// Salida de /dev/zonas: JSON por imagen en `src/content/` y su validación con `validarVilla()`.
// Se usa en el cliente (errores en vivo) y en /api/dev/zonas (revalida antes de escribir).

export type TipoImagen = "portada" | "plano" | "conjunto" | "transicion";

export interface ImagenZonas {
  /** Ruta pública de la imagen: identifica la entrada. */
  clave: string;
  tipo: TipoImagen;
  imagen: string;
  /** Destino relativo a `src/content/`. */
  archivo: string;
  villaId?: VillaId;
  plantaId?: string;
  transicionId?: string;
  poligonos: readonly PoligonoEditable[];
}

/** Estancia dibujada en un plano; las fotos y demás datos se añaden en el contenido de la villa. */
export type EstanciaZona = Pick<Estancia, "id" | "nombre" | "tipo" | "poligono">;

export type SalidaZonas = { imagen: string; zonas: readonly Zona[] } | { imagen: string; estancias: readonly EstanciaZona[] } | Conjunto;

/** JSON a guardar con los polígonos cerrados (los abiertos siguen en edición). */
export function construirSalida(entrada: Pick<ImagenZonas, "tipo" | "imagen">, poligonos: readonly PoligonoEditable[]): SalidaZonas {
  const { imagen } = entrada;
  const cerrados = poligonos.filter((p) => p.cerrado);
  switch (entrada.tipo) {
    case "portada":
    case "transicion":
      return {
        imagen,
        zonas: cerrados.map((p) => ({ id: p.id, nombre: p.nombre, poligono: p.puntos, accion: p.accion ?? "galeria", destino: p.destino ?? "" })),
      };
    case "plano":
      return { imagen, estancias: cerrados.map((p) => ({ id: p.id, nombre: p.nombre, tipo: p.tipo ?? "otro", poligono: p.puntos })) };
    case "conjunto":
      return { imagen, parcelas: cerrados.map((p) => ({ villaId: p.id as VillaId, poligono: p.puntos })) };
  }
}

/** Inversa de `construirSalida`: carga un JSON guardado en el editor. */
export function aEditables(salida: SalidaZonas): PoligonoEditable[] {
  if ("zonas" in salida) {
    return salida.zonas.map(({ id, nombre, poligono, accion, destino }) => ({ id, nombre, puntos: poligono, cerrado: true, accion, destino }));
  }
  if ("estancias" in salida) {
    return salida.estancias.map(({ id, nombre, tipo, poligono }) => ({ id, nombre, puntos: poligono, cerrado: true, tipo }));
  }
  return salida.parcelas.map(({ villaId, poligono }) => ({ id: villaId, nombre: "", puntos: poligono, cerrado: true }));
}

/** Errores de la salida al meterla en su villa (o en el conjunto) y pasar `validarVilla()`; [] = válida. */
export function validarSalida(entrada: Omit<ImagenZonas, "poligonos">, salida: SalidaZonas, villas: readonly Villa[]): string[] {
  const errores: string[] = [];
  if (salida.imagen !== entrada.imagen) {
    errores.push(`imagen: "${salida.imagen}" no corresponde a ${entrada.imagen}`);
  }

  if ("parcelas" in salida) {
    errores.push(...validarConjunto(salida, villas.map((v) => v.id)), ...villas.flatMap((villa) => validarVilla(villa, { conjunto: salida })));
    return [...new Set(errores)];
  }

  const villa = villas.find((v) => v.id === entrada.villaId);
  if (!villa) return [...errores, `villa: "${entrada.villaId}" no existe`];

  if ("zonas" in salida) {
    // Portada: es la cabecera de la villa. Transición: zonas sobre su imagen final, con las mismas reglas.
    const zonas = entrada.tipo === "portada" ? validarVilla({ ...villa, hero: { ...villa.hero, zonas: salida.zonas } }) : validarZonas(salida.zonas, villa, "zonas");
    return [...errores, ...zonas];
  }
  const planta = villa.plantas.findIndex((p) => p.id === entrada.plantaId);
  if (planta < 0) return [...errores, `planta: "${entrada.plantaId}" no existe en ${villa.id}`];
  const estancias = salida.estancias.map((e) => ({ ...e, fotos: [] }));
  return [...errores, ...validarVilla({ ...villa, plantas: villa.plantas.map((p, i) => (i === planta ? { ...p, estancias } : p)) })];
}

type Objeto = Record<string, unknown>;
export const esObjeto = (v: unknown): v is Objeto => typeof v === "object" && v !== null && !Array.isArray(v);
const esTexto = (v: unknown): v is string => typeof v === "string";
const esPoligono = (v: unknown): v is Poligono =>
  Array.isArray(v) && v.every((p) => Array.isArray(p) && p.length === 2 && p.every((c) => typeof c === "number"));
const incluye = <T extends string>(lista: readonly T[], v: unknown): v is T => lista.includes(v as T);

/** Comprueba la forma de un JSON recibido (no su validez) y lo copia solo con los campos conocidos; null si no encaja. */
export function leerSalida(tipo: TipoImagen, valor: unknown): SalidaZonas | null {
  if (!esObjeto(valor) || !esTexto(valor.imagen)) return null;
  const { imagen } = valor;
  const lista = (campo: string) => (Array.isArray(valor[campo]) && valor[campo].every(esObjeto) ? (valor[campo] as Objeto[]) : null);

  if (tipo === "conjunto") {
    const parcelas = lista("parcelas");
    if (!parcelas?.every((p) => esTexto(p.villaId) && esPoligono(p.poligono))) return null;
    return { imagen, parcelas: parcelas.map((p) => ({ villaId: p.villaId as VillaId, poligono: p.poligono as Poligono })) };
  }
  if (tipo === "plano") {
    const estancias = lista("estancias");
    if (!estancias?.every((e) => esTexto(e.id) && esTexto(e.nombre) && incluye(TIPOS_ESTANCIA, e.tipo) && esPoligono(e.poligono))) return null;
    return { imagen, estancias: estancias.map((e) => ({ id: e.id, nombre: e.nombre, tipo: e.tipo, poligono: e.poligono }) as EstanciaZona) };
  }
  const zonas = lista("zonas");
  if (!zonas?.every((z) => esTexto(z.id) && esTexto(z.nombre) && esPoligono(z.poligono) && incluye(ACCIONES_ZONA, z.accion) && esTexto(z.destino))) {
    return null;
  }
  return { imagen, zonas: zonas.map((z) => ({ id: z.id, nombre: z.nombre, poligono: z.poligono, accion: z.accion, destino: z.destino }) as Zona) };
}
