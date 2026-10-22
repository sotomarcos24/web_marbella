import { devOnly } from "@/lib/dev/devOnly";

// Comprobación de que las herramientas internas están activas; patrón para el resto de /api/dev/*.
export const GET = devOnly(() => Response.json({ ok: true }));
