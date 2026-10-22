# Fase 1 — Soto Village Marbella: cimientos + herramientas internas

## Context
Frontend de demo (producción-ready más adelante) para 4 villas en Puerto Banús. Esta fase NO construye las páginas finales ni el explorador visual: solo cimientos (stack, marca, diseño, datos, calculadora, reservas mock, pipeline de fotos) y las herramientas /dev. `/home/sotomarcos24/web_marbella` tiene solo CLAUDE.md + `.claude/` (git local, 1 commit). Repo remoto: https://github.com/sotomarcos24/web_marbella. Node 24 / npm 11. No hay `cwebp`/ImageMagick → usar `sharp` (npm) para WebP, recortes y planos.

## Decisiones del usuario
- **Fotos**: ya ha llegado `imgs/` (fuera de git): `imgs/<villa>/statics/*.jpg` (66–73 fotos por villa, 1920 px de ancho), `imgs/<villa>/movement/` vacía y `imgs/idea_para_web.mp4` (referencia de la experiencia). El pipeline se testea con fixtures sintéticos y se ejecuta sobre `statics/`.
- **Visión** (fases 2–5): `docs/vision.md`. Esta fase deja previstos sus tipos de datos y que `/dev/zonas` trabaje con cualquier imagen. Motor de scroll elegido: Motion `useScroll` + `position: sticky` (sin GSAP).
- **Flujo**: usar el flujo de CLAUDE.md: `git remote add origin`, y `/milestone "Fase 1"` para desglosar en issues (aprobación del usuario) → `/issue N` por cada uno (tests primero, qa-reviewer, PR, aprobación antes de merge).
- **Clasificación de fotos**: subagentes en paralelo, uno por villa (visión sobre cada foto); yo consolido y reviso.

## Desglose propuesto en issues (orden; ‖ = paralelizable)
1. **Scaffold** (S): Next.js (App Router, última estable), TS estricto (`strict`, `noUncheckedIndexedAccess`), Tailwind, ESLint, Vitest, `npm run typecheck|lint|test`. Estructura `src/{app,components,config,content,i18n,lib,messages,types}`.
2. **i18n + marca** (S, dep 1): next-intl con rutas `/[locale]` (es por defecto, en), `src/messages/es.json` y `en.json`, proxy de next-intl (`src/proxy.ts`, el antiguo middleware); `src/config/site.ts` (nombre, email y teléfono de ejemplo; el nombre solo aquí). Motion + Lenis instalados y configurados (`LenisProvider` cliente, respeta `prefers-reduced-motion`).
3. **Sistema de diseño + /dev/estilos** (M, dep 1; ‖ con 4–6): tokens Tailwind (cal #F7F2EA, arena #E6D3B3, terracota #C2603E, oliva #6B7350, mar #1F3A4D, tinta #2B2420, noche #14110F), Cormorant Garamond (display, con cursiva) + DM Sans vía `next/font`, página que muestra paleta, tipografías, botones, tarjetas, inputs, motion y una muestra de escena oscura.
4. **Tipos + modelo de datos + villas.ts** (M, dep 1; ‖ 3): `src/types/villa.ts` (Poligono = `[number, number][]` en 0–1; `Zona`, `Estancia`, `Planta`, `Exterior`, `Hero`; previstos para la Fase 2: `Conjunto`/`Parcela`, `Recorrido`, `destacadas`), `src/content/villas.ts` con las 4 villas (datos §5, plazas 15, `combinableCon` 4↔5, `pendientes`: inscripción turística, coordenadas; villa-1 dormitorios marcado "pendiente de confirmar: plano muestra 6"), validación con test (polígonos ≥3 vértices, coords en [0,1], ids únicos, IDs de destino existentes).
5. **Tarifas + servicios** (S, dep 4): `tarifas.ts` (tabla 12 meses × grupos, `estimado: true` en villa-3 julio, reglas de estancia 3–59, invierno >28 noches dic–mar, horarios, limpieza, suplementos, fianza, pagos, cancelación, mascotas), `servicios.ts` (solo los 7 listados; limpieza diaria PROVISIONAL), textos en messages.
6. **Textos de villas** (M, dep 4; ‖): leer las 7 URLs (WebFetch), adaptar a `messages/{es,en}.json`: sin "Lirios Village" (marca vía site.ts/ICU), sin nombres de personas, capacidad 15, "mucama"→limpieza, sin normas de apartamentos; menús del chef copiados, biografía genérica.
7. **Calculadora** `src/lib/pricing.ts` (M, dep 5): función pura (`calcularPrecio({villa, entrada, salida, huespedes, mascotas, extras, hoy})`) → noches con precio por noche (cruza meses), alojamiento, limpieza final, suplementos (13.º–15.º: 150 € villa 4/5, villa-1 250 € solo agosto, resto 150 € estimado), extras (compra: 80 € + 40 €/100 € extra tras 200 €), total con IVA, fianza aparte, calendario de pagos (25 %/75 % a 30 días, 100 % si <30), fecha límite cancelación (60 días), avisos/errores (mín. 3 noches, capacidad 15, máx. 59, oferta invierno). Fechas como strings ISO/`Date` UTC para evitar bugs de zona horaria. Tests Vitest: los 6 mínimos del enunciado + límites (cruce de año, invierno >28, 59/60 noches, mascotas, villa-1 agosto, extras).
8. **Reservas mock** `src/lib/booking/` (S, dep 7): `BookingProvider` (`disponibilidad`, `cotizar`, `crearReserva`), `MockBookingProvider` con `occupied.json` inventado, tests (rango ocupado, solapes).
9. **Pipeline de fotos** (L, dep 4): script `scripts/process-photos.ts` con sharp: lee `imgs/<villa>/statics/`, WebP optimizado a `public/images/villas/<villa>/`, sin tocar originales; ignora `movement/`, "fotos con personas" y el vídeo de referencia; aparta rótulo 5G, Guest services, mapa de distancias, cartas de bienvenida, placa con logo; el mapa aéreo del conjunto queda apartado como "pendiente de edición" (base de la aérea limpia de la Fase 3); recorta sello "Heated Pool" en `_001` (o marca descartada); separa planos (villa1_027_1, villa3_029_1, villa4_025_1, villa5_024_1) en planta baja con jardín / planta alta, sin logo/dirección/texto legal (recorte por coordenadas revisadas visualmente). Clasificación: 4 subagentes (uno por villa) devuelven JSON; yo genero `src/content/fotos.ts` (villa, archivo, zona, tipo, estanciaSugerida, confianza, alt ES/EN) y la tabla resumen + lista de baja confianza. Portadas provisionales: villa-3 → villa3_019, villa-5 → villa5_002, villa-1 → villa1_012, villa-4 → villa4_059.
10. **/dev/zonas** (M, dep 4, 9 parcial): editor cliente: elegir imagen (portadas, planos, aérea del conjunto, imágenes finales de transiciones), clic = vértice, cerrar polígono, id/nombre, editar/mover/borrar vértices, exportar JSON. "Guardar en src/content" mediante route handler `/api/dev/...` que escribe **solo en `NODE_ENV=development`** (404 en producción). Coordenadas normalizadas.
11. **/dev/fotos** (M, dep 9, 4): lista de estancias y exteriores a la izquierda, miniaturas a la derecha, drag & drop (dnd nativo HTML5), marcar principal, persiste en `src/content` por el mismo route handler dev.
12. **/dev/cotizador** (S, dep 7, 8): formulario (villa, fechas, huéspedes, mascotas, extras) → desglose completo de `pricing.ts`.
Protección /dev: layout `notFound()` fuera de desarrollo (no se publica).

## Archivos críticos
`package.json`, `tsconfig.json`, `next.config.ts`, `src/config/site.ts`, `src/i18n/*`, `messages/{es,en}.json`, `src/types/villa.ts`, `src/content/{villas,tarifas,servicios,fotos}.ts`, `src/lib/pricing.ts`, `src/lib/booking/*`, `scripts/process-photos.ts`, `src/app/[locale]/dev/{estilos,zonas,fotos,cotizador}/`.

## Reglas transversales
- Ningún texto visible en componentes: todo vía next-intl; textos de contenido de villas en messages (o claves i18n referenciadas desde content).
- Importes en céntimos (enteros) dentro de la calculadora para evitar errores de coma flotante; formateo solo en UI (Intl).
- Sin backend/cookies/SEO: la escritura de /dev es solo para desarrollo local.

## Verificación
- `npm run typecheck && npm run lint && npm test` en verde (salida mostrada por issue).
- Tests clave: villa-4 3 noches agosto 10 huéspedes = 5.490 € (25 % = 1.372,50 €); villa-1 30 jun–3 jul = 5.826 €; 14 huéspedes +300 €; 2 noches error; 16 huéspedes error; llegada en 20 días → 100 %.
- `npm run dev`: abrir `/es/dev/estilos`, `/en/dev/estilos`, `/dev/zonas` (dibujar, exportar), `/dev/fotos` (arrastrar, principal), `/dev/cotizador` (comparar con tests); comprobar que con `NODE_ENV=production` `/dev/*` da 404.
- Pipeline: ejecutar sobre `imgs/<villa>/statics/`; verificar visualmente portadas recortadas y planos separados; originales intactos (checksum).
- Cada issue: `qa-reviewer` PASS, PR con "Closes #N", aprobación del usuario antes de merge.
