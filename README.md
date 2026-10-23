# Soto Village Marbella

Frontend de la web de alquiler vacacional de 4 villas en Puerto Banús. Next.js (App Router) + TypeScript + Tailwind.

## Requisitos
Node 24 y npm 11.

## Comandos
```bash
npm install          # instalar dependencias
npm run dev          # servidor de desarrollo (http://localhost:3000)
npm run build        # build de producción
npm run lint         # ESLint
npm run typecheck    # TypeScript sin emitir
npm run test         # tests (Vitest)
npm run photos       # fotos de imgs/<villa>/statics/ → WebP en public/images/villas/<villa>/
npm run plans        # planos → una imagen por planta (baja con jardín / alta)
```

## Herramientas internas (/dev)
Solo funcionan con `npm run dev`: con el build de producción, páginas y rutas dan 404 en producción (`src/app/[locale]/dev/layout.tsx` y `devOnly()` en `src/lib/dev/devOnly.ts`). Las páginas existen en ambos idiomas (`/es/dev/...`, `/en/dev/...`).

| Herramienta | Uso |
|---|---|
| `/dev/estilos` | Guía de estilos: colores, tipografía, componentes de `src/components/ui/` y demo de Motion. |
| `/dev/cotizador` | Calculadora de precios: villa, fechas, huéspedes y servicios; muestra el desglose de `src/lib/pricing.ts`. |
| `/dev/zonas` | Dibuja polígonos (coordenadas 0–1) sobre portadas, planos, la aérea del conjunto y las imágenes finales de las transiciones. Guardar escribe el JSON en `src/content/zonas/` (la aérea, en `src/content/conjunto.json`). |
| `/dev/fotos` | Asigna cada foto de una villa a una estancia o exterior (una foto, un destino). Guardar escribe `src/content/fotos/<villa>.json`. |
| `/api/dev/estado` | `GET` → `{ "ok": true }` si las herramientas están activas. |
| `/api/dev/zonas` | `POST` que usa `/dev/zonas` para guardar; revalida los polígonos antes de escribir. |
| `/api/dev/fotos` | `POST` que usa `/dev/fotos` para guardar; revalida la asignación antes de escribir. |

Los datos que siguen sin confirmar están en [`docs/pendientes.md`](docs/pendientes.md).

Documentación del proyecto en `docs/`.
