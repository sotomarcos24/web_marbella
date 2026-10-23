# CLAUDE.md

## Proyecto
Frontend de la web de alquiler vacacional **Soto Village Marbella**: 4 villas de lujo (villa-1, 3, 4, 5) en Calle Los Lirios, Puerto Banús. Solo frontend: sin backend, base de datos, pagos reales, cookies ni SEO. Demo en local, pero código limpio y modular, apto para producción.
- Especificación: `docs/SPEC.md` · Plan: `docs/plan.md` · Milestones e issues: `docs/milestones.md` · Experiencia interactiva (fases 2–5): `docs/vision.md`.
- Repo: https://github.com/sotomarcos24/web_marbella
- Estado: Fase 2 en curso (M6, issues #48–#55). Siguiente → #49 (#48 ya cerrado).

## Flujo de trabajo
- Eres el agente principal: coordinas, mantienes el contexto y lanzas subagentes; no delegues decisiones de diseño.
- Todo trabajo parte de un issue de GitHub con criterios de aceptación. Planificar: `/milestone <objetivo>`. Implementar: `/issue <número>`.
- Tests primero: los criterios de aceptación se convierten en tests antes de escribir código.
- Quien escribe el código no lo revisa: la revisión la hace el subagente `qa-reviewer` en contexto limpio.
- Máximo 3 rondas de corrección por issue; si no pasa, para y explica el bloqueo.
- Plan mode con aprobación solo en issues L o si te apartas de los criterios aprobados. Orden: tests → código → `/simplify` (solo M y L) → lint/typecheck/test una vez → `qa-reviewer` (recibe esos resultados; se salta en S de solo contenido o docs) → PR.
- Aprobación del usuario: el desglose en issues (`/milestone`). Con QA en PASS y checks en verde, merge directo. Para y pregunta solo si QA falla 3 veces, si cambias el modelo de datos o si vas a gastar créditos de Pletor. `/ok` fuerza un merge.
- En paralelo: un worktree por issue (`../web_marbella-N`, rama `issue-N`), cada uno con su terminal y `/issue N`. En los worktrees no se toca la línea Estado ni `docs/milestones.md`; al terminar, `/sincronizar` en la carpeta principal borra los worktrees fusionados, comprueba el `main` combinado y actualiza el progreso.
- Progreso: GitHub es la única fuente de verdad. La línea Estado solo indica el siguiente issue; `docs/milestones.md` se actualiza al cerrar cada milestone. Sin commits solo de progreso.
- Al cerrar un milestone, para y da un resumen de 5 líneas con qué revisar en el navegador.
- Los documentos no se testean.
- `AGENTS.md` lo regenera Next: consulta `node_modules/next/dist/docs/` solo cuando uses una API de Next que no conozcas, no en cada issue.

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
- Datos pendientes siempre marcados, nunca inventados: inscripción turística, coordenadas, dormitorios de villa-1 (plano muestra 6), tarifa de julio de villa-3 (estimada), limpieza diaria (provisional), lista del pack desayuno.
- Fotos: originales en `imgs/<villa>/statics/` y vídeos/imágenes con movimiento en `imgs/<villa>/movement/` (lo del conjunto, en `imgs/conjunto/`); siempre separados, fuera de git y sin modificar. No usar rótulo 5G, Guest services, mapa de distancias, cartas de bienvenida ni placa con logo. El mapa aéreo del conjunto no se publica tal cual: solo como base de la aérea limpia.
- Transiciones: cada una termina en una imagen fija real; las zonas clicables aparecen solo al llegar. La web funciona sin vídeos (sustituto: fundido/zoom) y respeta `prefers-reduced-motion`.
- Pletor (IA de vídeo): antes de cada generación, anunciar qué y cuánto cuesta, esperar el OK y comprobar el saldo antes y después. Presupuesto del prototipo: 700 créditos. Registrar todo en `src/content/transiciones.json`.
- Servicios: solo los de `docs/SPEC.md` §9 (sin traslados, despedidas, fotos ni spa).
