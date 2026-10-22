/** Las herramientas internas solo existen en `next dev`. Se lee en cada llamada, no al importar. */
export function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}
