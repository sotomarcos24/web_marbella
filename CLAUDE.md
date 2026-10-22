# CLAUDE.md

## Proyecto
Frontend de la web de alquiler vacacional **Soto Village Marbella**: 4 villas de lujo (villa-1, 3, 4, 5) en Calle Los Lirios, Puerto Banús. Solo frontend: sin backend, base de datos, pagos reales, cookies ni SEO. Demo en local, pero código limpio y modular, apto para producción.
- Especificación: `docs/SPEC.md` · Plan: `docs/plan.md` · Milestones e issues: `docs/milestones.md` · Experiencia interactiva (fases 2–5): `docs/vision.md`.
- Repo: https://github.com/sotomarcos24/web_marbella
- Estado: Fase 1 (cimientos + herramientas internas, issues #1–#19; cerrados: #1, #2; siguiente paso `/issue 3`). La visión está aprobada; se implementa al cerrar la Fase 1. Pletor (MCP) aún sin acceso: solo hace falta en la Fase 3.

## Flujo de trabajo
- Eres el agente principal: coordinas, mantienes el contexto y lanzas subagentes; no delegues decisiones de diseño.
- Todo trabajo parte de un issue de GitHub con criterios de aceptación. Planificar: `/milestone <objetivo>`. Implementar: `/issue <número>`.
- Tests primero: los criterios de aceptación se convierten en tests antes de escribir código.
- Quien escribe el código no lo revisa: la revisión la hace el subagente `qa-reviewer` en contexto limpio.
- Máximo 3 rondas de corrección por issue; si no pasa, para y explica el bloqueo.
- Necesitas aprobación del usuario en dos momentos: el desglose en issues y antes de hacer merge.
- El visto bueno de merge llega con `/ok`: anota el progreso (`docs/milestones.md`, línea Estado de este archivo…), hace merge del PR a main, cierra el issue y borra la rama.

## Stack y comandos
Next.js (App Router) + TypeScript estricto + Tailwind · next-intl (es por defecto, en) · Motion + Lenis (scroll con `useScroll` + `position: sticky`; sin GSAP) · Vitest · sharp y ffmpeg para imágenes y fotogramas. Última versión estable de cada librería, salvo TypeScript 6.0 y ESLint 9 (`eslint-config-next` aún no admite TS 7 ni ESLint 10).
Comandos previstos (se crean en el issue de scaffold): `npm run dev | build | lint | typecheck | test`. Antes de dar algo por hecho: lint, typecheck y tests en verde.

## Estructura
`src/{app,components,config,content,i18n,lib,messages,types}` · `scripts/` (pipeline de fotos y fotogramas) · `public/images/villas/<villa>/` · `public/media/transiciones/<villa>/`.
- `src/config/site.ts`: único lugar donde se escribe el nombre de la marca.
- `src/content/`: `villas.ts`, `tarifas.ts`, `servicios.ts`, `fotos.ts`.
- `src/lib/pricing.ts`: calculadora pura. `src/lib/booking/`: interfaz `BookingProvider` + `MockBookingProvider`; el frontend solo usa la interfaz.
- `/dev/*` y `/api/dev/*`: herramientas internas, solo en desarrollo (404 en producción).

## Convenciones
- Ningún texto visible en componentes: todo en `src/messages/es.json` y `en.json` (mismas claves; lo vigila la regla de lint `react/jsx-no-literals`). Nada de "Lirios Village", ni nombres de personas de las fichas antiguas.
- Zonas y estancias: polígonos en coordenadas normalizadas 0–1 sobre su imagen.
- Capacidad máxima siempre 15 (tope legal andaluz). Importes en céntimos enteros; formato solo en UI. Fechas en UTC; `pricing.ts` recibe `hoy` como parámetro.
- Datos pendientes siempre marcados, nunca inventados: inscripción turística, coordenadas, dormitorios de villa-1 (plano muestra 6), tarifa de julio de villa-3 (estimada), limpieza diaria (provisional).
- Fotos: originales en `imgs/<villa>/statics/` y vídeos/imágenes con movimiento en `imgs/<villa>/movement/` (lo del conjunto, en `imgs/conjunto/`); siempre separados, fuera de git y sin modificar. No usar rótulo 5G, Guest services, mapa de distancias, cartas de bienvenida ni placa con logo. El mapa aéreo del conjunto no se publica tal cual: solo como base de la aérea limpia.
- Transiciones: cada una termina en una imagen fija real; las zonas clicables aparecen solo al llegar. La web funciona sin vídeos (sustituto: fundido/zoom) y respeta `prefers-reduced-motion`.
- Pletor (IA de vídeo): antes de cada generación, anunciar qué y cuánto cuesta, esperar el OK y comprobar el saldo antes y después. Presupuesto del prototipo: 700 créditos. Registrar todo en `src/content/transiciones.json`.
- Servicios: solo los de `docs/SPEC.md` §9 (sin traslados, despedidas, fotos ni spa).
