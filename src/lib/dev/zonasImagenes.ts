import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { villas as villasContenido } from "@/content/villas";
import type { PoligonoEditable } from "@/lib/dev/polygon";
import { resolveContentPath } from "@/lib/dev/writeContent";
import { aEditables, leerSalida, type ImagenZonas } from "@/lib/dev/zonasSalida";
import type { Villa } from "@/types/villa";

// Imágenes sobre las que se dibuja en /dev/zonas (solo servidor: lee `public/` y `src/content/`).
// - Portadas y planos: los de `villas.ts` que existen en `public/`.
// - Aérea del conjunto: `public/images/conjunto/*` y la imagen final de las transiciones del conjunto (T1).
// - Transiciones de villa: `public/media/transiciones/<villa>/<id>/final.<ext>` (convención: la imagen fija en la que termina).

const ES_IMAGEN = /\.(webp|jpe?g|png|avif)$/i;
const ES_FINAL = /^final\.(webp|jpe?g|png|avif)$/i;

type Entrada = Omit<ImagenZonas, "poligonos">;

const existe = (archivo: string) => access(archivo).then(() => true, () => false);

/** Nombres de entradas de `dir` que cumplen `filtro`, ordenados; [] si no existe. */
async function listar(dir: string, filtro: (e: { name: string; isFile(): boolean }) => boolean): Promise<string[]> {
  const entradas = await readdir(dir, { withFileTypes: true }).catch(() => []);
  return entradas.filter(filtro).map((e) => e.name).sort();
}

/** Ruta pública de la imagen `final.*` de cada transición dentro de `media/transiciones/<ambito>/`. */
async function finalesDeTransicion(publicDir: string, ambito: string): Promise<{ id: string; imagen: string }[]> {
  const dir = path.join(publicDir, "media", "transiciones", ambito);
  const ids = await listar(dir, (e) => !e.isFile());
  const finales = await Promise.all(
    ids.map(async (id) => {
      const [final] = await listar(path.join(dir, id), (e) => e.isFile() && ES_FINAL.test(e.name));
      return final ? [{ id, imagen: `/media/transiciones/${ambito}/${id}/${final}` }] : [];
    }),
  );
  return finales.flat();
}

/** Polígonos del JSON guardado si existe, encaja y es de esta imagen; si no, `porDefecto`. */
async function poligonosGuardados(contentDir: string, entrada: Entrada, porDefecto: readonly PoligonoEditable[]): Promise<readonly PoligonoEditable[]> {
  try {
    const salida = leerSalida(entrada.tipo, JSON.parse(await readFile(resolveContentPath(entrada.archivo, contentDir), "utf8")));
    if (salida?.imagen === entrada.imagen) return aEditables(salida);
  } catch {
    // Sin archivo o JSON roto: se parte de los datos por defecto.
  }
  return porDefecto;
}

interface Opciones {
  publicDir?: string;
  contentDir?: string;
  villas?: readonly Villa[];
}

const PUBLIC_DIR = path.join(process.cwd(), "public");

/** Entradas cuya imagen existe en `public/`, con los polígonos de `villas.ts` (sin leer los JSON guardados). */
export async function entradasZonas({ publicDir = PUBLIC_DIR, villas = villasContenido }: Opciones = {}): Promise<ImagenZonas[]> {
  const [aereas, conjunto, transiciones] = await Promise.all([
    listar(path.join(publicDir, "images", "conjunto"), (e) => e.isFile() && ES_IMAGEN.test(e.name)),
    finalesDeTransicion(publicDir, "conjunto"),
    Promise.all(villas.map((villa) => finalesDeTransicion(publicDir, villa.id))),
  ]);

  const candidatas: ImagenZonas[] = [
    ...villas.flatMap((villa): ImagenZonas[] => [
      {
        clave: villa.hero.imagenDia,
        tipo: "portada",
        imagen: villa.hero.imagenDia,
        archivo: `zonas/${villa.id}/portada.json`,
        villaId: villa.id,
        poligonos: aEditables({ imagen: villa.hero.imagenDia, zonas: villa.hero.zonas }),
      },
      ...villa.plantas.map((planta): ImagenZonas => ({
        clave: planta.imagenPlano,
        tipo: "plano",
        imagen: planta.imagenPlano,
        archivo: `zonas/${villa.id}/${planta.id}.json`,
        villaId: villa.id,
        plantaId: planta.id,
        poligonos: aEditables({ imagen: planta.imagenPlano, estancias: planta.estancias }),
      })),
    ]),
    ...[...aereas.map((n) => `/images/conjunto/${n}`), ...conjunto.map((t) => t.imagen)].map(
      (imagen): ImagenZonas => ({ clave: imagen, tipo: "conjunto", imagen, archivo: "conjunto.json", poligonos: [] }),
    ),
    ...villas.flatMap((villa, i) =>
      (transiciones[i] ?? []).map(
        ({ id, imagen }): ImagenZonas => ({
          clave: imagen,
          tipo: "transicion",
          imagen,
          archivo: `zonas/transiciones/${villa.id}/${id}.json`,
          villaId: villa.id,
          transicionId: id,
          poligonos: [],
        }),
      ),
    ),
  ];

  const presentes = await Promise.all(candidatas.map((e) => existe(path.join(/*turbopackIgnore: true*/ publicDir, e.imagen))));
  return candidatas.filter((_, i) => presentes[i]);
}

/** Entradas de `entradasZonas` con los polígonos del JSON guardado cuando lo hay. */
export async function catalogoZonas({ contentDir = path.join(process.cwd(), "src", "content"), ...opciones }: Opciones = {}): Promise<ImagenZonas[]> {
  const entradas = await entradasZonas(opciones);
  return Promise.all(entradas.map(async (e) => ({ ...e, poligonos: await poligonosGuardados(contentDir, e, e.poligonos) })));
}
