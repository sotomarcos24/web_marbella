import { lstat, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { isDev } from "@/lib/dev/isDev";

const CONTENT_DIR = path.join(process.cwd(), "src", "content");

/** Ruta absoluta dentro de `contentDir`; lanza si `relPath` está vacía, es absoluta o contiene `..`. */
export function resolveContentPath(relPath: string, contentDir = CONTENT_DIR): string {
  if (!relPath) {
    throw new Error("Ruta de contenido vacía");
  }
  if (path.isAbsolute(relPath) || path.win32.isAbsolute(relPath)) {
    throw new Error(`Ruta de contenido absoluta: ${relPath}`);
  }
  // Política, no solo seguridad: sin ".." aunque resuelva dentro (zonas/../villas.json).
  if (relPath.split(/[\\/]/).includes("..")) {
    throw new Error(`Ruta de contenido con "..": ${relPath}`);
  }
  const root = path.resolve(/*turbopackIgnore: true*/ contentDir);
  const target = path.resolve(root, relPath);
  if (!target.startsWith(root + path.sep)) {
    throw new Error(`Ruta fuera de la carpeta de contenido: ${relPath}`);
  }
  return target;
}

/** Lanza si algún tramo existente de `relPath` es un enlace simbólico: `writeFile` lo seguiría fuera de `contentDir`. */
async function rechazarEnlaces(relPath: string, contentDir: string): Promise<void> {
  let actual = path.resolve(/*turbopackIgnore: true*/ contentDir);
  for (const tramo of relPath.split(/[\\/]/).filter(Boolean)) {
    actual = path.join(actual, tramo);
    const info = await lstat(actual).catch(() => null);
    if (!info) return;
    if (info.isSymbolicLink()) {
      throw new Error(`Ruta de contenido con enlace simbólico: ${relPath}`);
    }
  }
}

/** Escribe en `src/content/` (solo en desarrollo). Los objetos se guardan como JSON formateado. */
export async function writeContent(relPath: string, data: string | object, contentDir = CONTENT_DIR): Promise<void> {
  if (!isDev()) {
    throw new Error("writeContent solo está disponible en desarrollo");
  }
  const target = resolveContentPath(relPath, contentDir);
  await rechazarEnlaces(relPath, contentDir);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, typeof data === "string" ? data : `${JSON.stringify(data, null, 2)}\n`);
}
