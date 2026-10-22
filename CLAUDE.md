# CLAUDE.md

## Proyecto
Frontend de la web de alquiler vacacional **Soto Village Marbella**: 4 villas de lujo (villa-1, 3, 4, 5) en Calle Los Lirios, Puerto Banús. Solo frontend: sin backend, base de datos, pagos reales, cookies ni SEO. Demo en local, pero código limpio y modular, apto para producción.
- Especificación: `docs/SPEC.md` · Plan: `docs/plan.md` · Milestones e issues: `docs/milestones.md`.
- Repo: https://github.com/sotomarcos24/web_marbella
- Estado: Fase 1 (cimientos + herramientas internas). Las páginas finales y el explorador visual vienen en fases posteriores.

## Flujo de trabajo
- Eres el agente principal: coordinas, mantienes el contexto y lanzas subagentes; no delegues decisiones de diseño.
- Todo trabajo parte de un issue de GitHub con criterios de aceptación. Planificar: `/milestone <objetivo>`. Implementar: `/issue <número>`.
- Tests primero: los criterios de aceptación se convierten en tests antes de escribir código.
- Quien escribe el código no lo revisa: la revisión la hace el subagente `qa-reviewer` en contexto limpio.
- Máximo 3 rondas de corrección por issue; si no pasa, para y explica el bloqueo.
- Necesitas aprobación del usuario en dos momentos: el desglose en issues y antes de hacer merge.

## Stack y comandos
Next.js (App Router) + TypeScript estricto + Tailwind · next-intl (es por defecto, en) · Motion + Lenis · Vitest · sharp para imágenes. Última versión estable de cada librería.
Comandos previstos (se crean en el issue de scaffold): `npm run dev | build | lint | typecheck | test`. Antes de dar algo por hecho: lint, typecheck y tests en verde.

## Estructura
`src/{app,components,config,content,i18n,lib,messages,types}` · `scripts/` (pipeline de fotos) · `public/images/villas/<villa>/`.
- `src/config/site.ts`: único lugar donde se escribe el nombre de la marca.
- `src/content/`: `villas.ts`, `tarifas.ts`, `servicios.ts`, `fotos.ts`.
- `src/lib/pricing.ts`: calculadora pura. `src/lib/booking/`: interfaz `BookingProvider` + `MockBookingProvider`; el frontend solo usa la interfaz.
- `/dev/*` y `/api/dev/*`: herramientas internas, solo en desarrollo (404 en producción).

## Convenciones
- Ningún texto visible en componentes: todo en `messages/es.json` y `en.json` (mismas claves). Nada de "Lirios Village", ni nombres de personas de las fichas antiguas.
- Zonas y estancias: polígonos en coordenadas normalizadas 0–1 sobre su imagen.
- Capacidad máxima siempre 15 (tope legal andaluz). Importes en céntimos enteros; formato solo en UI. Fechas en UTC; `pricing.ts` recibe `hoy` como parámetro.
- Datos pendientes siempre marcados, nunca inventados: inscripción turística, coordenadas, dormitorios de villa-1 (plano muestra 6), tarifa de julio de villa-3 (estimada), limpieza diaria (provisional).
- Fotos: nunca modificar los originales (carpeta `imgs/` que aportará el usuario); no usar rótulo 5G, Guest services, mapa de distancias, mapa aéreo del conjunto, cartas de bienvenida ni placa con logo.
- Servicios: solo los de `docs/SPEC.md` §9 (sin traslados, despedidas, fotos ni spa).
