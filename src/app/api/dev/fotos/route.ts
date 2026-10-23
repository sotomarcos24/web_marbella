import { villas } from "@/content/villas";
import { devOnly } from "@/lib/dev/devOnly";
import { leerAsignacion, validarAsignacion } from "@/lib/dev/fotosAsignacion";
import { destinosDeVilla, fotosDeVilla } from "@/lib/dev/fotosVilla";
import { writeContent } from "@/lib/dev/writeContent";
import { esObjeto } from "@/lib/dev/zonasSalida";

// Guarda las asignaciones de /dev/fotos. La ruta de destino sale de la villa (nunca del cliente) y la asignación se revalida aquí.
export const POST = devOnly(async (request: Request) => {
  const cuerpo: unknown = await request.json().catch(() => null);
  const { villa: villaId, asignacion: recibida } = esObjeto(cuerpo) ? cuerpo : {};
  const villa = villas.find((v) => v.id === villaId);
  const asignacion = leerAsignacion(recibida);
  if (!villa || !asignacion) {
    return Response.json({ ok: false, errores: ["petición no válida: villa desconocida o asignación mal formada"] }, { status: 400 });
  }

  const errores = validarAsignacion(asignacion, await destinosDeVilla(villa.id), fotosDeVilla(villa.id));
  if (errores.length > 0) {
    return Response.json({ ok: false, errores }, { status: 422 });
  }
  const archivo = `fotos/${villa.id}.json`;
  await writeContent(archivo, asignacion);
  return Response.json({ ok: true, archivo });
});
