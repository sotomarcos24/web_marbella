import { villas } from "@/content/villas";
import { devOnly } from "@/lib/dev/devOnly";
import { writeContent } from "@/lib/dev/writeContent";
import { entradasZonas } from "@/lib/dev/zonasImagenes";
import { esObjeto, leerSalida, validarSalida } from "@/lib/dev/zonasSalida";

// Guarda los polígonos de /dev/zonas. La ruta de destino sale del catálogo (nunca del cliente) y la salida se revalida aquí.
export const POST = devOnly(async (request: Request) => {
  const cuerpo: unknown = await request.json().catch(() => null);
  const { clave, salida: recibida } = esObjeto(cuerpo) ? cuerpo : {};
  const entrada = (await entradasZonas()).find((e) => e.clave === clave);
  const salida = entrada && leerSalida(entrada.tipo, recibida);
  if (!entrada || !salida) {
    return Response.json({ ok: false, errores: ["petición no válida: clave desconocida o salida mal formada"] }, { status: 400 });
  }

  const errores = validarSalida(entrada, salida, villas);
  if (errores.length > 0) {
    return Response.json({ ok: false, errores }, { status: 422 });
  }
  await writeContent(entrada.archivo, salida);
  return Response.json({ ok: true, archivo: entrada.archivo });
});
