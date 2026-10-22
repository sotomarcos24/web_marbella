# Milestones y issues — Fase 1

Creados en GitHub (milestones 1–4, issues #1–#19). Los cambios marcados con **[visión]** salen de `docs/vision.md` (aprobada) y ya están en los issues de GitHub. Fases 2–5 (experiencia interactiva): `docs/vision.md` §5; sus milestones (M5, M6…) se crearán con `/milestone` al terminar la Fase 1. Tamaños: S < 0,5 día · M ≈ 1 día · L > 1 día (partir si es posible). Un PR por issue. Cada issue: tests primero, `qa-reviewer`, aprobación antes de merge.

Etiquetas: `setup`, `i18n`, `design`, `data`, `content`, `pricing`, `booking`, `photos`, `dev-tools`, `blocked`.

## Resumen y orden

| Milestone | Objetivo | Issues |
|---|---|---|
| M1 Cimientos ✅ | Proyecto arrancable, i18n, marca, diseño | #1–#4 |
| M2 Datos y negocio ✅ | Modelo, tarifas, servicios, calculadora, reservas mock | #5–#10 |
| M3 Contenido y fotos | Textos ES/EN y pipeline de fotos | #11–#15 |
| M4 Herramientas /dev | /dev/cotizador, /dev/zonas, /dev/fotos | #16–#19 |

Orden recomendado: M1 → M2 → (M3 ‖ resto de M2) → M4. Paralelizables: #3 ‖ #5; #6 ‖ #7 ‖ #11 tras #5; #8 ‖ #9 tras #7; #17 ‖ #18 tras #16.

Dependencias: #2←#1 · #3←#1,#2 · #4←#1 · #5←#1 · #6←#5 · #7←#5 · #8←#6,#7 · #9←#8 · #10←#9 · #11←#5,#2 · #12←#1 · #13←#12 · #14←#12 · #15←#13,#14,#5 · #16←#9,#10 · #17←#5,#14 · #18←#15,#17 · #19←#5.

---

# M1 — Cimientos

### #1 Scaffold del proyecto — `setup` · S · ✅ PR #20
Next.js (App Router, última estable) + TypeScript estricto + Tailwind + ESLint + Vitest.
- [x] `npm run dev|build|lint|typecheck|test` funcionan en limpio
- [x] `tsconfig` con `strict` y `noUncheckedIndexedAccess`
- [x] Un test de ejemplo de Vitest pasa
- [x] Estructura `src/{app,components,config,content,i18n,lib,messages,types}` y alias `@/*`
- [x] `.gitignore` (ampliar el existente, que ya excluye `imgs/`), remoto `origin` configurado y README mínimo con comandos
Archivos: `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.mts`, `eslint.config.mjs`.

### #2 i18n (es/en), marca, Motion y Lenis — `i18n`, `setup` · M · dep #1 · ✅ PR #21
- [x] Rutas `/[locale]`; `es` por defecto, `en` disponible; middleware de next-intl
- [x] `messages/es.json` y `messages/en.json`; ningún texto visible escrito en componentes (regla de lint o test que lo verifique)
- [x] `src/config/site.ts` con nombre "Soto Village Marbella", email y teléfono de ejemplo; el nombre no aparece escrito en ningún otro archivo (test de búsqueda)
- [x] Test: claves de es.json y en.json idénticas
- [x] Motion instalado; `LenisProvider` cliente configurado y desactivado con `prefers-reduced-motion`
- [x] Selector de idioma básico funcionando
Archivos: `src/i18n/*`, `src/proxy.ts` (Next 16 renombra `middleware.ts`), `src/messages/*.json`, `src/config/site.ts`, `src/components/providers/LenisProvider.tsx`.

### #3 Sistema de diseño y /dev/estilos — `design` · M · dep #1,#2 · ✅ PR #22
- [x] Tokens Tailwind: cal, arena, terracota, oliva, mar, tinta y **[visión]** noche (#14110F) con los hex exactos
- [x] **[visión]** Cormorant Garamond (display, con cursiva) y DM Sans (texto) con `next/font`
- [x] Componentes base: Button, Card, Input, Heading, Container
- [x] `/dev/estilos` muestra paleta, tipografías, escala de texto, botones, tarjetas, inputs, una animación Motion y **[visión]** una muestra de escena oscura
- [x] Contraste del texto sobre fondo cal ≥ AA (comprobado)
Archivos: `src/app/globals.css` (`@theme`), `src/config/{theme,fonts}.ts`, `src/lib/contrast.ts`, `src/components/ui/*`, `src/app/[locale]/dev/estilos/page.tsx`. Terracota (3,74:1) y oliva (4,49:1) no llegan a AA para texto normal sobre cal: solo texto grande y elementos no textuales; botón principal en mar.

### #4 Protección de /dev y utilidades de escritura dev — `dev-tools`, `setup` · S · dep #1 · ✅ PR #23
- [x] Layout de `/dev/*` devuelve `notFound()` si `NODE_ENV !== 'development'` (test)
- [x] Helper `src/lib/dev/writeContent.ts`: escribe solo dentro de `src/content/`, rechaza rutas con `..` o absolutas (tests)
- [x] Route handler `/api/dev/*` responde 404 fuera de desarrollo (test)
Archivos: `src/app/[locale]/dev/layout.tsx`, `src/lib/dev/*`, `src/app/api/dev/*`.

---

# M2 — Datos y negocio

### #5 Tipos y modelo de datos — `data` · M · dep #1 · ✅ PR #24
- [x] `src/types/villa.ts`: `Poligono` (`[x,y][]` normalizado), `Zona`, `Estancia`, `Planta`, `Exterior`, `Hero`, `Villa`
- [x] Validador `validarVilla()` con tests: polígonos ≥3 vértices, coordenadas en [0,1], ids únicos, destinos de zonas existentes
- [x] Tipos de `Tarifa`, `Servicio`, `Foto` definidos
- [x] **[visión]** Tipos previstos para la Fase 2: `Conjunto` (`imagen`, `parcelas: { villaId, poligono }[]`), `Recorrido` (`id`, `transicion`, `imagenFinal`) y `destacadas` (ids de estancias existentes), cubiertos por `validarVilla()`
Archivos: `src/types/*`, `src/lib/validation/villa.ts`.

### #6 Datos de las villas (`villas.ts`) — `data` · M · dep #5 · ✅ PR #26
- [x] 4 villas con datos de SPEC §6; plazas máximas 15 en todas
- [x] `combinableCon` en villa-4 y villa-5 (mutuo); test de reciprocidad
- [x] Campos pendientes (inscripción turística, coordenadas) vacíos y marcados en `pendientes`
- [x] villa-1: dormitorios 7 con marca "pendiente de confirmar (plano muestra 6)"
- [x] Hero con portadas provisionales (rutas placeholder) y zonas `jardin`, `planta-baja`, `planta-alta` con polígonos de ejemplo
- [x] Todas las villas pasan `validarVilla()`

### #7 Tarifas (`tarifas.ts`) — `pricing`, `data` · S · dep #5 · ✅ PR #25
- [x] Tabla de 12 meses × villa-1 / villa-3 / villa-4-5 exacta (test comparando con SPEC §8)
- [x] villa-3 julio con `estimado: true`
- [x] Constantes: estancia 3–59, invierno >28 noches dic–mar, entrada 16:00/salida 10:00, limpieza 450 €, fianza 1.000 €, pagos 25/75 a 30 días, cancelación 60 días y 2 %, mascotas 200 €, suplementos por villa
- [x] Importes en céntimos enteros

### #8 Servicios (`servicios.ts`) — `data` · S · dep #6,#7 · ✅ PR #27
- [x] Solo los 7 servicios de SPEC §9; sin traslados, despedidas, fotos ni spa (test de ids permitidos)
- [x] Limpieza diaria marcada `provisional`; catamarán `bajoPresupuesto`
- [x] Fórmula de compra previa (80 € hasta 200 € + 40 € por cada 100 € adicionales) con tests
- [x] Menús del chef (paella, barbacoa) y lista del pack desayuno como datos (lista del pack **pendiente de confirmar**: `packDesayuno.pendiente`)

### #9 Calculadora `pricing.ts` — `pricing` · L · dep #8 · ✅ PR #28
Tests primero.
- [x] villa-4, 3 noches agosto, 10 huéspedes → 5.490 €; 25 % = 1.372,50 €
- [x] villa-1, 30 jun–3 jul → 5.826 €
- [x] villa-4, 14 huéspedes, 3 noches agosto → +300 €
- [x] 2 noches → error estancia mínima; 60 noches → error estancia máxima
- [x] 16 huéspedes → error de capacidad
- [x] Llegada en 20 días → 100 % al reservar; ≥30 días → 25 %/75 % con fechas
- [x] Precio por noche según el mes de cada noche (cruce de mes y de año)
- [x] >28 noches en dic–mar → aviso "Solicita oferta de estancia de invierno" sin precio
- [x] Suplemento villa-1 250 € solo si agosto; resto según SPEC; mascotas y extras suman al total
- [x] Devuelve fianza aparte, fecha límite de cancelación gratuita (llegada − 60 días) y avisos (tarifa estimada, limpieza cada 2 días incluida)
- [x] Función pura (sin `Date.now()` interno: recibe `hoy`); fechas en UTC
Decisiones: villa-1 sin suplemento fuera de agosto (250 € si alguna noche cae en agosto); la oferta de invierno cuenta solo las noches de dic–mar.
Archivos: `src/lib/pricing.ts`, `src/lib/pricing.test.ts`.

### #10 Reservas simuladas — `booking` · M · dep #9 · ✅ PR #29
- [x] Interfaz `BookingProvider` (`disponibilidad`, `cotizar`, `crearReserva`)
- [x] `MockBookingProvider` con `occupied.json` inventado (≥3 rangos por villa)
- [x] Tests: rango libre/ocupado, solape parcial, `cotizar` delega en `pricing`, `crearReserva` rechaza fechas ocupadas
- [x] Ninguna importación de `MockBookingProvider` fuera de un único punto de composición
Decisiones: rangos semiabiertos (el día de salida queda libre); el punto de composición lo vigila `no-restricted-imports` en ESLint.
Archivos: `src/lib/booking/{types,mock,occupied.json,index}.ts`.

---

# M3 — Contenido y fotos

### #11 Textos de las villas (ES/EN) — `content`, `i18n` · M · dep #6,#2 ✅ PR #30
- [x] Descripciones y comodidades de las 4 fichas copiadas y adaptadas a `messages/{es,en}.json`
- [x] Sin "Lirios Village", sin nombres de personas (Eva, Laura, Iván), capacidad 15 (test de búsqueda de términos prohibidos)
- [x] ES y EN revisados; sin "mucama"
- [x] Distribución de camas por villa (fuente: ficha, pendiente de confirmar; sin contrastar con planos)
Archivos: `src/content/{comodidades,dormitorios}.ts`, `docs/fuentes/`, `tests/villas-textos.test.ts`.

### #12 Textos generales y servicios (ES/EN) — `content`, `i18n` · M · dep #8,#2 ✅ PR #31
- [x] Condiciones de reserva y normas de la casa adaptadas, sin normas de apartamentos
- [x] Descripción de servicios y menús del chef; presentación genérica del chef (sin la biografía actual)
- [x] Test: términos prohibidos ausentes, claves es/en idénticas

### #13 Pipeline de fotos: conversión y filtrado — `photos` · L · dep #1 ✅ PR #32
Desarrollado con fixtures sintéticos; ejecución real sobre `imgs/` (ya disponible).
- [x] `scripts/process-photos.ts` con `sharp`: **[visión]** lee `imgs/<villa>/statics/*.jpg` → WebP en `public/images/villas/<villa>/`
- [x] No modifica los originales (test de checksum)
- [x] **[visión]** Ignora `movement/`, "fotos con personas" y `imgs/idea_para_web.mp4`; lista de exclusión configurable (rótulo 5G, Guest services, mapa de distancias, cartas de bienvenida, placa con logo)
- [x] **[visión]** `mapa_villas_1_3_4_5_1.jpg` apartado como "pendiente de edición" (no se publica; base de la aérea limpia de la Fase 3)
- [x] Recorte configurable del sello "Heated Pool" por coordenadas; si no es viable, marca "descartada"
- [x] Informe de salida (procesadas, apartadas, descartadas)

### #14 Pipeline de fotos: planos por planta — `photos` · M · dep #13
- [ ] Recorte configurable por planta (baja con jardín / alta) para **[visión]** villa1_027_1, villa3_029_1, villa4_025_1, villa5_024_1
- [ ] Sin logo, dirección ni texto legal (recortes verificados visualmente al ejecutar con `imgs/`)
- [ ] Salida: `planta-baja.webp` y `planta-alta.webp` por villa

### #15 Catálogo `fotos.ts` y resumen — `photos`, `data` · L · dep #13,#14 · **[visión]** desbloqueado (`imgs/` ya está; quitar la etiqueta `blocked`)
- [ ] 4 subagentes en paralelo (uno por villa) clasifican cada foto; el agente principal consolida
- [ ] `fotos.ts` con villa, archivo, zona, tipo, estanciaSugerida, confianza, alt ES y EN
- [ ] Portadas provisionales apuntan a villa3_019, villa5_002, villa1_012, villa4_059
- [ ] Test: todo archivo de `fotos.ts` existe en `public/`; tipos válidos
- [ ] Tabla resumen por villa y lista de baja confianza entregadas
- [ ] **[visión]** Señalar fotos nocturnas con el mismo encuadre que la portada (para el botón día/noche), si las hay

---

# M4 — Herramientas /dev

### #16 /dev/cotizador — `dev-tools`, `pricing` · S · dep #9,#10,#4
- [ ] Formulario: villa, fechas, huéspedes, mascotas, extras
- [ ] Muestra desglose completo: noches, alojamiento, limpieza, suplementos, extras, total, fianza aparte, pagos con fechas, límite de cancelación, avisos y errores
- [ ] Usa `BookingProvider` (no el mock directo); muestra disponibilidad
- [ ] Resultado coincide con los tests de #9 para los casos de ejemplo

### #17 /dev/zonas — `dev-tools` · L · dep #5,#4 (mejor con #14)
- [ ] Selector de imagen (portadas y planos de `public/images/villas`; **[visión]** también la aérea del conjunto y las imágenes finales de transiciones, para parcelas y zonas)
- [ ] Clic añade vértices; cerrar polígono; coordenadas normalizadas 0–1 (lógica pura testeada)
- [ ] Id y nombre; editar (mover vértices) y borrar
- [ ] Exportar JSON y guardar en `src/content` vía `/api/dev` (solo en desarrollo)
- [ ] Salida valida contra `validarVilla()`

### #18 /dev/fotos — `dev-tools` · L · dep #15,#17
- [ ] Por villa: izquierda estancias y exteriores, derecha miniaturas
- [ ] Arrastrar foto a estancia/exterior; persiste en `src/content`
- [ ] Marcar foto principal por estancia
- [ ] Muestra confianza baja y estanciaSugerida del catálogo
- [ ] Lógica de asignación pura con tests

### #19 Revisión final de Fase 1 — `setup` · S · dep todo lo anterior
- [ ] `typecheck`, `lint`, `test` y `build` en verde
- [ ] `/dev/*` da 404 con build de producción
- [ ] Tabla de pendientes (inscripción turística, coordenadas, dormitorios villa-1, aérea limpia del conjunto, vídeos, tarifas estimadas, limpieza diaria provisional, y los de `docs/vision.md` §7)
- [ ] README actualizado con cómo usar las herramientas /dev
