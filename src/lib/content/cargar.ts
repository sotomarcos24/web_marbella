import { readFileSync } from "node:fs";
import path from "node:path";
import { EXTERIORES, leerAsignacion } from "@/lib/dev/fotosAsignacion";
import { leerSalida, type EstanciaZona, type TipoImagen } from "@/lib/dev/zonasSalida";
import type { Conjunto, Exterior, Pendiente, Villa, Zona } from "@/types/villa";

// Carga (solo servidor) los JSON que guardan /dev/zonas y /dev/fotos en `src/content/` y los mete en el modelo.
// Un JSON ausente no es un error: queda sin zonas, estancias o fotos y se marca en `pendientes`.
// Un JSON presente pero roto, con forma incorrecta o de otra imagen lanza: es un fallo del contenido, no un dato pendiente.

const CONTENT_DIR = path.join(process.cwd(), "src", "content");

/** Contenido parseado de `archivo` (relativo a `contentDir`), o undefined si no existe. */
function leerJson(archivo: string, contentDir: string): unknown {
  let texto: string;
  try {
    texto = readFileSync(path.join(contentDir, archivo), "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
  try {
    return JSON.parse(texto);
  } catch {
    throw new Error(`${archivo}: JSON no válido`);
  }
}

/** Salida de /dev/zonas del tipo dado; undefined si no existe el archivo. */
function leerZonas(tipo: TipoImagen, archivo: string, imagen: string | undefined, contentDir: string) {
  const json = leerJson(archivo, contentDir);
  if (json === undefined) return undefined;
  const salida = leerSalida(tipo, json);
  if (!salida) throw new Error(`${archivo}: forma no válida`);
  if (imagen !== undefined && salida.imagen !== imagen) {
    throw new Error(`${archivo}: imagen "${salida.imagen}" no corresponde a ${imagen}`);
  }
  return salida;
}

const pendiente = (campo: string, nota: string): Pendiente => ({ campo, nota });

/** Villa con las zonas del hero, las estancias de cada planta y las fotos tomadas de los JSON de `contentDir`. */
export function cargarVilla(villa: Villa, contentDir = CONTENT_DIR): Villa {
  const pendientes: Pendiente[] = [...villa.pendientes];

  const portada = leerZonas("portada", `zonas/${villa.id}/portada.json`, villa.hero.imagenDia, contentDir);
  const zonas: readonly Zona[] = portada && "zonas" in portada ? portada.zonas : [];
  if (zonas.length === 0) pendientes.push(pendiente("hero.zonas", "pendiente de dibujar las zonas en /dev/zonas"));

  const estanciasPorPlanta = villa.plantas.map((planta) => {
    const plano = leerZonas("plano", `zonas/${villa.id}/${planta.id}.json`, planta.imagenPlano, contentDir);
    const estancias: readonly EstanciaZona[] = plano && "estancias" in plano ? plano.estancias : [];
    if (estancias.length === 0) pendientes.push(pendiente(`plantas.${planta.id}.estancias`, "pendiente de dibujar las estancias en /dev/zonas"));
    return estancias;
  });

  const json = leerJson(`fotos/${villa.id}.json`, contentDir);
  const asignacion = json === undefined ? {} : leerAsignacion(json);
  if (!asignacion) throw new Error(`fotos/${villa.id}.json: forma no válida`);
  if (Object.keys(asignacion).length === 0) pendientes.push(pendiente("fotos", "pendiente de asignar las fotos en /dev/fotos"));

  const rutas = (id: string) => (asignacion[id] ?? []).map((archivo) => `/images/villas/${villa.id}/${archivo}`);
  const exteriores: Exterior[] = EXTERIORES.filter((id) => rutas(id).length > 0).map((id) => ({ id, fotos: rutas(id) }));

  return {
    ...villa,
    pendientes,
    hero: { ...villa.hero, zonas },
    plantas: villa.plantas.map((planta, i) => ({
      ...planta,
      estancias: (estanciasPorPlanta[i] ?? []).map((estancia) => ({ ...estancia, fotos: rutas(estancia.id) })),
    })),
    exteriores,
  };
}

/** Conjunto de `conjunto.json`, o null si no existe. */
export function cargarConjunto(contentDir = CONTENT_DIR): Conjunto | null {
  const salida = leerZonas("conjunto", "conjunto.json", undefined, contentDir);
  return salida && "parcelas" in salida ? salida : null;
}
