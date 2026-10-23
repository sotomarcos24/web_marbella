# VISIÓN — Experiencia interactiva de Soto Village Marbella

Estado: **aprobada por el usuario (2026-10-22)**, incluidos los cambios de la §6, ya trasladados a los issues de GitHub. Su implementación empieza al cerrar la Fase 1 (issues #1–#19).

Marca: "Soto Village Marbella" (solo en `src/config/site.ts`; lo crea el issue #2).

---

## 1. Referencia: Reposé Residence (Dubái)

Grabación: `imgs/idea_para_web.mp4` (51 s, 704×778, 30 fps; está en `imgs/` y por tanto fuera de git). Revisada con fotogramas a 2 por segundo.

| Tiempo | Qué ocurre | Qué tomamos |
|---|---|---|
| 0–1 s | Fondo casi negro, logo lineal de un **arco** con una puerta y el nombre en versalitas pequeñas. Clic sobre el arco. | Intro con arco andaluz. |
| 1–2,5 s | La cámara atraviesa nubes. Título serif grande ("REPOSÉ RESIDENCE") sobre el cielo, que se desvanece. | Nubes + nombre de marca en serif. |
| 2,5–5,5 s | Vista aérea inclinada que desciende hacia la urbanización. Termina en un fundido a oscuro con un titular ("Ready to rise."). | Descenso de dron hasta el conjunto. |
| 6–10 s | Vídeo controlado por el scroll: el edificio se construye hasta el render final al atardecer. Titular a la izquierda ("Why Dubai?"). | *No aplica* (las villas ya existen). Sustituto: día → atardecer/noche de la villa, si hay fotos. |
| 10–25 s | "Explore residences": sobre la imagen del edificio, oscurecida, se elige una planta → aparece el plano de esa planta con cada vivienda en un color plano translúcido (azul, verde, lila, ocre) sobre fondo oscuro → clic en una vivienda → plano blanco de esa vivienda en un panel a la derecha, con datos a la izquierda y botón "View in 3D" que lo inclina en perspectiva. "Back to floors" vuelve atrás. | Plano de planta con estancias en colores suaves + panel lateral con fotos y datos. |
| 25–31 s | Travelling: de la fachada al atardecer a la puerta de entrada, y la puerta se abre al recibidor ("Welcome to Reposé"). | Transición puerta → recibidor (T3). |
| 31–38 s | Cambio a fondo claro (crema). "Step inside the everyday." en serif grande con cursiva. Cuatro tarjetas con máscara de **arco** que entran escalonadas (salón, cocina, dormitorio, baño); al hacer clic, la estancia se abre a pantalla completa con su nombre en serif ("The Bedroom — Rooms made to return to."). | Tarjetas en arco y apertura a pantalla completa. |
| 38–42 s | "Twelve ways to spend a day.": lista de servicios en serif a la derecha; al pasar el ratón por cada uno, cambia la imagen de previsualización de la izquierda. | Lista de servicios con previsualización. |
| 42–48 s | Secciones tipo revista: titulares enormes que se cruzan con imágenes (algunas en arco) que entran en horizontal ("A slower kind of everyday.", "Find your balance.", "Room to move.", "Time to exhale."). | Secciones editoriales con desplazamiento horizontal. |
| 48–51 s | "Simply be." y vídeo final a pantalla completa (piscina infinita) con titular blanco encima. | Cierre con vídeo/foto a pantalla completa. |

**Estética**: transiciones y exploradores en oscuro (casi negro, texto blanco fino); secciones editoriales en claro (crema/blanco roto); serif de display alta y condensada, con cursiva para contraste; mucho aire; movimientos lentos y suaves; cambios de escena con fundido a oscuro o a crema.

---

## 2. Experiencia de Soto Village Marbella

Se construye primero entera para la **Villa 4** (prototipo) y luego se replica en las villas 1, 3 y 5 cambiando solo datos.

### 2.1 Intro (inicio, `/`)
- Fondo oscuro. Logo lineal: **arco andaluz** de medio punto sobre columnas (como el porche de las villas 4 y 5, ver `villa4_059`) con el nombre de la marca debajo. Se dibuja con un trazo SVG animado.
- Al hacer clic en el arco, o al empezar a bajar, la cámara cruza el arco, atraviesa nubes sobre la costa y desciende hasta el bloque de las 4 villas (**T1**). Con clic la secuencia avanza sola; con la rueda avanza al ritmo del scroll.
- Termina en la **foto aérea limpia del conjunto** (imagen fija).

### 2.2 Mapa del conjunto (inicio)
- Imagen fija de llegada de T1: aérea sin marcadores. La web dibuja las 4 parcelas (1, 3, 4, 5) como polígonos.
- Al pasar el ratón: la parcela se ilumina (el resto se oscurece) y aparece una mini ficha: nombre, plazas (15), dormitorios, precio "desde" (mínimo de `tarifas.ts`, con su marca de estimado si aplica).
- En móvil/teclado: las parcelas también son botones enfocables; el primer toque muestra la ficha y el segundo navega.
- Al hacer clic: la cámara baja hasta la villa (**T2**) y se navega a su página, que empieza exactamente en la imagen donde termina T2.

### 2.3 Página de villa — cabecera (`/villas/villa-4`)
- Foto grande de la villa (Villa 4: `villa4_059`, fachada desde el jardín).
- Zonas interactivas (polígonos): `jardin` → abre la galería del jardín; `planta-baja` y `planta-alta` → llevan al plano de esa planta. Al pasar el ratón la zona se oscurece ligeramente y aparece su nombre.
- Botón día/noche (solo si existe foto nocturna con el mismo encuadre; *pendiente*: verificar en la clasificación de fotos #15; si no hay, el botón no se muestra).
- Botón "Ver todas las fotos" (galería a pantalla completa por estancias).

### 2.4 Plano de planta ("Explorar la villa")
- Fondo oscuro, selector "Planta baja / Planta alta" (equivalente a elegir planta en la referencia).
- Plano de la planta (de los recortes del issue #14) con cada estancia en un color suave translúcido de la paleta (arena, oliva, mar, terracota… a baja opacidad).
- Clic en una estancia → panel lateral: nombre, tipo, camas, baño en suite, medidas (si hay), carrusel con sus fotos. "Volver a plantas".
- *Sin* la vista 3D de la referencia: no tenemos modelo 3D. Como sustituto ligero, el plano puede inclinarse en perspectiva CSS al abrir el panel (decisión de diseño menor, se valida en el prototipo).

### 2.5 Entrar en la casa
- Sección con scroll: de la puerta de entrada (`villa4_078`) al recibidor con la escalera de caracol (`villa4_044`) (**T3**), con titular "Bienvenido a casa" y, opcionalmente, del recibidor al salón (`villa4_022`) (**T4**).

### 2.6 "Dentro de la villa"
- Cambio a fondo claro (cal). Titular serif grande. Tarjetas con **máscara de arco** (salón, cocina, dormitorio principal, baño, porche/piscina) que entran escalonadas.
- Clic → la estancia se abre a pantalla completa (animación de layout de la tarjeta a pantalla completa) con su nombre en serif y una frase; Escape o "cerrar" vuelve.

### 2.7 Servicios
- Lista en serif (solo los de `docs/SPEC.md` §9: chef privado, limpieza diaria, compra antes de llegar, pack desayuno, decoración de bienvenida, catamarán privado y calefacción de piscina). Al pasar el ratón cambia la imagen de previsualización.
- *Pendiente*: fotos para chef, compra, desayuno, decoración y catamarán (no están en `imgs/`). Mientras tanto, previsualización tipográfica o foto de la villa relacionada; nunca fotos inventadas presentadas como reales.

### 2.8 Editorial y ficha clásica
- Secciones tipo revista con imágenes que entran en horizontal: "Un día en Puerto Banús", "Para grupos" (villas 4+5 combinables, hasta 30), "Invierno en la Costa del Sol" (estancias largas, oferta de invierno).
- Debajo de todo, la ficha clásica: descripción, comodidades, distribución de camas, normas, reseñas (*pendiente*: no hay reseñas reales aún; sección oculta hasta tenerlas), ubicación (*pendiente*: coordenadas) y reserva con la calculadora (`pricing.ts` vía `BookingProvider`).

---

## 3. Plan técnico

### 3.1 Motor de scroll: **Motion `useScroll` + CSS `position: sticky`** (no GSAP)
Justificación:
- Motion y Lenis ya están en el stack (Fase 1, issue #2). Añadir GSAP duplicaría motor de animación y el bucle de Lenis.
- Las escenas fijadas se hacen con un contenedor alto y un hijo `sticky` (CSS nativo): sin el "pin-spacer" de ScrollTrigger, que choca con el layout de React y con Next.js al cambiar de ruta.
- `useScroll({ target, offset })` da un `MotionValue` 0–1 por escena, sin re-renderizar React; con `useMotionValueEvent` se dibuja el fotograma en el canvas dentro de `requestAnimationFrame`.
- Lenis suaviza el scroll de la ventana y Motion lo lee igual; además, `lenis.scrollTo` sirve para el modo "clic y avanza solo".
- Si en el prototipo aparece algo que Motion no resuelve bien (p. ej. scroll horizontal con snapping complejo), se reconsidera GSAP (gratuito con todos sus plugins) solo para esa sección.

### 3.2 Componente `ScrollSequence` (secuencias de fotogramas)
- Cada transición se convierte (script con ffmpeg + sharp, `scripts/build-frames.ts`) en WebP numerados: escritorio 1600 px de ancho a ~24 fps; móvil 800 px a 12 fps. Manifiesto JSON con número de fotogramas, tamaños y la imagen fija final.
- Se dibujan en un `<canvas>` con cálculo tipo `object-fit: cover` y `devicePixelRatio`.
- Dos modos de avance con el mismo componente: **scroll** (progreso = scroll de la escena) y **clic** (progreso animado en el tiempo con `animate()` de Motion, o `lenis.scrollTo` si la escena está en el flujo de scroll).
- **Precarga progresiva**: primero el fotograma 0 y el último, luego uno de cada 8, después uno de cada 4… hasta completar. Si el fotograma pedido no ha cargado, se dibuja el más cercano cargado. Se empieza a precargar cuando la escena está a una pantalla de distancia (`IntersectionObserver`).

### 3.3 Cada transición termina en una imagen fija
- La imagen de llegada es la **foto real** (no el último fotograma de la IA), recortada exactamente igual que el fotograma final usado como entrada del vídeo. En el último 5 % del progreso se funde el canvas con esa foto: así se oculta cualquier deriva de la IA.
- Las zonas clicables (SVG encima de la imagen) solo aparecen cuando el progreso llega a 1, con un fundido corto; mientras la cámara se mueve no hay zonas.
- Zonas en coordenadas normalizadas 0–1 sobre esa imagen fija, en un `<svg viewBox="0 0 1 1" preserveAspectRatio="xMidYMid slice">`, que reproduce el mismo recorte que `object-fit: cover`: las zonas coinciden con la foto en cualquier tamaño de pantalla.
- Polígonos definidos con `/dev/zonas` (issue #17), que tendrá que admitir también la aérea del conjunto (parcelas).

### 3.4 Sustitutos sin vídeo (la web funciona sin vídeos)
- Si una transición no tiene fotogramas en su manifiesto, `ScrollSequence` usa un **fundido + zoom suave (efecto Ken Burns)** de la imagen de inicio a la de llegada, con el mismo progreso y el mismo final fijo. El prototipo de la Fase 2 se hace entero así.
- T1 sin vídeo: nubes en capas (imágenes/CSS) con parallax sobre la aérea, y zoom hacia el conjunto.

### 3.5 Accesibilidad y móvil
- `prefers-reduced-motion`: sin secuencias ni Ken Burns; fundido simple entre imagen de inicio y de llegada; Lenis desactivado (ya previsto en #2).
- Móvil (ancho < 768 px o `navigator.connection.saveData`): fotogramas de 800 px a 12 fps; para las transiciones por clic (T2), se reproduce el MP4 comprimido con `<video muted playsinline>` en lugar de fotogramas. Si la conexión es lenta, fundido simple.
- Todas las zonas y parcelas son también botones accesibles (foco, `aria-label`, Enter), y el mapa tiene una lista alternativa de villas.
- Textos de todas las escenas en `messages/{es,en}.json`.

### 3.6 Navegación entre páginas (T2)
- T2 se reproduce en el inicio y termina en la portada de la villa; después se navega (`router.push`) a `/villas/villa-4`, cuya cabecera es la misma imagen: el cambio de página es invisible. Si el usuario entra directamente en la URL de la villa, la página empieza en la imagen fija, sin transición.

### 3.7 Modelo de datos (ampliación del de la Fase 1)
- `src/content/conjunto.ts`: `{ imagen, parcelas: [{ villaId, poligono }] }`.
- `villa.hero` añade `transicionEntrada?` (id de T2) y `villa.recorrido`: `[{ id, transicion, imagenFinal, titularKey }]` (T3, T4).
- `villa.destacadas`: ids de estancias para las tarjetas en arco.
- `servicios.ts`: `imagenPrevia?` por servicio (opcional; pendiente de fotos).
- `src/content/transiciones.json` (registro de generación, ver §4) y `public/media/transiciones/<villa>/<id>/manifest.json`.
- `validarVilla()` comprueba también que cada transición referenciada existe y que su imagen final coincide con la imagen de las zonas.

---

## 4. Vídeos de transición con Pletor (IA)

Los vídeos se generan a partir de **dos fotos reales** (inicio y llegada); la IA solo inventa el trayecto.

- **Pendiente previo**: Pletor está declarado en `.mcp.json`, pero el usuario no consigue iniciar sesión en el MCP (2026-10-22) y sus herramientas no están disponibles. No bloquea las fases 1 y 2; hay que resolverlo antes de la Fase 3 (`/mcp` → pletor → autenticar). Antes de la Fase 3: comprobar con `find_models` y la documentación de Pletor qué modelo admite fijar primer y último fotograma (modo `first_last_frame` o similar) y su coste. Referencia: 5 s con Seedance 2.0 y primer fotograma ≈ 95 créditos.
- **Prototipo solo con la Villa 4**:
  - T1 intro: cielo/nubes sobre la costa (imagen a generar) → aérea limpia del conjunto.
  - T2: aérea limpia del conjunto → `villa4_059` (fachada desde el jardín).
  - T3: `villa4_078` (puerta) → `villa4_044` (recibidor con escalera de caracol).
  - T4 (opcional): `villa4_044` → `villa4_022` (salón).
- **Aérea limpia**: a partir de `mapa_villas_1_3_4_5_1.jpg` (1920×1520), versión SIN marcadores, etiquetas "Villa N", líneas blancas de parcela ni el triángulo terracota con el logo. Los marcadores y las líneas no se pueden quitar solo recortando, así que se necesita edición con IA (inpainting); cuenta para el presupuesto. Las 4 copias del mapa (una por carpeta de villa) son visualmente iguales; se usa la de `villa4`.
- **Formato**: las fotos de T3/T4 son **verticales** (`villa4_078` y `villa4_044`: 1920×2876) y el vídeo será 16:9. Hay que recortar una banda horizontal de cada una (la puerta cabe; de la escalera se pierde la parte alta). Ese mismo recorte es la imagen fija final. Alternativa: generar también en 9:16 para móvil (duplica coste; no en el prototipo).
- **Prompts**: movimiento de cámara suave y continuo (dron que desciende, travelling hacia la puerta), luz mediterránea, sin personas ni texto, sin añadir ni cambiar elementos de la casa.
- **Presupuesto**: máximo **700 créditos** para todo el prototipo, repeticiones incluidas. Estimación inicial (a confirmar con `find_models`):

  | Paso | Estimación |
  |---|---|
  | Imagen de cielo/nubes (T1, inicio) | por confirmar (imagen) |
  | Aérea limpia (inpainting) | por confirmar (imagen) |
  | T1, T2, T3 (5 s cada uno) | ≈ 3 × 95 = 285 |
  | T4 (opcional) | ≈ 95 |
  | Margen para repeticiones | ≈ 200–300 |

- **Protocolo por generación**: anunciar qué se genera, con qué modelo y coste estimado → esperar el OK → comprobar saldo antes → generar → comprobar saldo después → revisar el resultado fotograma a fotograma. Si hay deformaciones o la casa cambia, avisar y proponer un ajuste de prompt antes de repetir.
- **Dónde se guarda cada cosa** (lo estático y lo que se mueve, siempre por separado):
  - Originales (fuera de git, nunca se modifican): fotos en `imgs/<villa>/statics/`; vídeos e imágenes con movimiento generados para esa villa (T2, T3, T4) en `imgs/<villa>/movement/`. Lo que es del conjunto y no de una villa va en `imgs/conjunto/statics/` (aérea limpia, imagen de cielo) e `imgs/conjunto/movement/` (T1).
  - Publicado (en git): fotos en `public/images/villas/<villa>/`; transiciones (MP4 comprimido para móvil + fotogramas WebP + `manifest.json`) en `public/media/transiciones/<villa|conjunto>/<id>/`.
- **Registro** en `src/content/transiciones.json`: id, villa, foto de inicio y de llegada (con el recorte aplicado), prompt, modelo, parámetros, coste, saldo antes/después, fecha y estado (aprobado/descartado). Sirve para repetirlo todo con las fotos del fotógrafo profesional.

---

## 5. Orden de trabajo y fases

0. **Fase 1** (issues #1–#19, ya en GitHub): se completa antes. Ajustes derivados de esta visión: ver §6.
1. **Este documento** → OK del usuario.
2. **Fase 2 — Prototipo de la Villa 4 con sustitutos** (sin vídeos). Milestones propuestos (se crearán con `/milestone` tras el OK):
   - **M5 Motor de escenas**: `ScrollSequence` (cover, modos scroll/clic, sustituto Ken Burns, reduced-motion) · `ZonasOverlay` (SVG slice, aparición al final, accesible) · carga en el modelo del contenido de `/dev` (JSON de zonas y fotos) · ampliación del modelo de datos (§3.7). Desglose simplificado: el canvas, la precarga progresiva, el script `build-frames` y el manifiesto pasan a la Fase 4; `transiciones.json`, a la Fase 3.
   - **M6 Prototipo Villa 4**: intro con arco + T1 sustituto · mapa del conjunto con parcelas y mini ficha + T2 sustituto · cabecera de villa con zonas, día/noche condicional y galería · plano de planta con estancias y panel · "Entrar en la casa" (T3 sustituto) · tarjetas en arco con apertura a pantalla completa.
3. **Fase 3 — Vídeos T1–T3 con Pletor** (con OK en cada generación): verificación de modelo y coste · aérea limpia · imagen de cielo · T1 · T2 · T3 · (T4) · registro en `transiciones.json`.
4. **Fase 4 — Integración**: `build-frames`, manifiesto, canvas y precarga progresiva; fotogramas en `ScrollSequence`, ajuste de tiempos y zonas sobre las imágenes finales, versión móvil con MP4.
5. **Fase 5 — Resto de la web**: servicios con previsualización, secciones editoriales, ficha clásica con reserva simulada, páginas y formularios, réplica para las villas 1, 3 y 5 y revisión final. Detalle y milestones M9–M13 en la §8 (M7 y M8 quedan para las fases 3 y 4). M9–M11 no dependen de los vídeos: si Pletor sigue bloqueado, pueden adelantarse a las fases 3 y 4.

Commits pequeños; un PR por issue (flujo de CLAUDE.md).

---

## 6. Cambios necesarios en la Fase 1 (aplicados en la documentación y en los issues #1, #3, #5, #13, #14, #15, #17 y #19)

- **Fotos**: la estructura real es `imgs/<villa>/statics/` (fotos) e `imgs/<villa>/movement/` (vídeos e imágenes con movimiento de esa villa; vacía por ahora). El pipeline de fotos lee solo `statics/`; el de fotogramas, solo `movement/`.
- **Planos**: los archivos reales son `villa1_027_1`, `villa3_029_1`, `villa4_025_1` y `villa5_024_1` (#14).
- **Mapa aéreo del conjunto**: ya ha llegado (`mapa_villas_1_3_4_5_1.jpg`). Sigue sin publicarse tal cual (lleva marcadores, líneas y logo), pero se usa como base para la aérea limpia (Fase 3). Hasta entonces, el prototipo usa un recorte/desenfoque provisional marcado como tal (#13, #15).
- **/dev/zonas** (#17): debe admitir la aérea del conjunto (parcelas) y cualquier imagen final de transición, no solo portadas y planos.
- **Sistema de diseño** (#3): añadir un tono "noche" para las escenas oscuras y elegir **Cormorant Garamond** como serif de display (alta y condensada, más cercana a la referencia; Fraunces queda descartada), con DM Sans para el texto. La paleta sigue siendo provisional.
- **Datos** (#5): dejar previstos los tipos de `conjunto`, `recorrido` y `destacadas` para no rehacer el modelo en la Fase 2.
- `.gitignore`: `imgs/` completa (originales y vídeo de referencia) no se sube a GitHub.

## 7. Pendientes (no se inventan)
- Foto nocturna de cada villa con el mismo encuadre (para día/noche).
- Fotos para la previsualización de servicios (chef, compra, desayuno, decoración, catamarán).
- Textos de las secciones editoriales (se redactarán y quedarán marcados para revisión).
- Reseñas reales, coordenadas, inscripción turística (ya pendientes en la Fase 1).
- Acceso a Pletor (el inicio de sesión en el MCP falla) y modelo con primer/último fotograma.
- Fotos del fotógrafo profesional (se repetirán las transiciones con el registro de `transiciones.json`).
- Textos de condiciones de reserva y normas de la casa (se adaptan de la web antigua, SPEC §7, y quedan marcados para revisión).
- Destino real de los formularios (email): hasta tenerlo, solo el proveedor simulado (§8.3).

---

## 8. Fase 5 — Resto de la web

Planificación sin implementar. Todo sale de los datos existentes (`villas.ts`, `tarifas.ts`, `servicios.ts`, `pricing.ts`, `BookingProvider`); los textos van en `messages/{es,en}.json` y lo pendiente se marca, nunca se inventa. Estética: cal y serif en páginas de contenido; noche solo en escenas.

### 8.1 Reserva simulada (sección "Reservar" de la ficha clásica, en la página de villa)
Asistente por pasos con el paso en la URL (`?paso=fechas|huespedes|resumen|datos|pago`) para que "atrás" funcione. Cada paso valida antes de avanzar; el resumen de precio queda visible a un lado (abajo en móvil) desde que hay fechas.
1. **Fechas**: calendario de dos meses (uno en móvil) con los días ocupados en gris y no seleccionables, leídos de `BookingProvider`. Marca entrada (16:00) y salida (10:00), respeta 3–59 noches y avisa al cruzar un rango ocupado. Accesible con teclado (rejilla con flechas, `aria-disabled` en ocupados).
2. **Huéspedes, mascotas y extras**: huéspedes 1–15 (aviso del suplemento del 13.º al 15.º), mascotas (200 € c/u) y extras de `servicios.ts` que tienen precio (chef con nº de comensales ≥ 10, limpieza diaria, cambio de ropa, compra, desayuno, decoración, calefacción por días). El catamarán aparece como "Bajo presupuesto" con enlace a contacto, sin precio.
3. **Desglose**: salida de `pricing.ts` tal cual: precio de cada noche (agrupado por mes), alojamiento, limpieza final, suplementos, mascotas, extras, total con IVA, fianza aparte, calendario de pagos y fecha límite de cancelación. Marcas de "estimado"/"provisional" visibles. Si `pricing.ts` devuelve `requiere-oferta` (> 28 noches dic–mar), el asistente para y enlaza a `/invierno` con villa y fechas ya rellenas.
4. **Datos del cliente**: nombre, apellidos, email, teléfono (con prefijo), país, hora estimada de llegada, comentarios y aceptación de condiciones y normas (enlaces a sus páginas). Validación en cliente con la misma librería que los formularios (§8.3).
5. **Pago simulado**: sin pasarela y **sin campos de tarjeta** (no se piden datos de pago reales en una demo). Muestra el importe de hoy (25 % o 100 %) y la fianza que se preautorizaría, con aviso claro de "Demo: no se realiza ningún cargo", y un botón "Confirmar reserva" que llama a `crearReserva`. Estados de carga y error (p. ej. fechas ocupadas entre medias → vuelve al paso 1).
6. **Confirmación** (`/reserva/[id]`): número de reserva, villa y fechas con horas, huéspedes y extras, total, calendario de pagos con fechas e importes, fianza (preautorización y devolución a los 2 días), fecha límite de cancelación gratuita (y cargo del 2 %), datos del titular y enlaces a normas y contacto. Si el id no existe (otra pestaña, recarga tras cerrar), mensaje "Reserva no encontrada".

**Cambios en el modelo de datos (requieren OK al crear el milestone):**
- `SolicitudReserva = SolicitudPrecio & { titular: Titular }`; `Reserva` añade `titular`, `creadaEn` y `estado: "confirmada"`.
- `BookingProvider` añade `ocupados(villa, desde, hasta): Promise<RangoFechas[]>` (para pintar el calendario sin consultar día a día) y `obtenerReserva(id)`.
- `MockBookingProvider` guarda las reservas creadas en `sessionStorage` (sin cookies ni backend) para que la página de confirmación las lea; las nuevas reservas también ocupan sus fechas en la sesión.
- Número de reserva legible (p. ej. `SVM-<año>-<5 cifras>`), generado por el mock.

### 8.2 Páginas, cabecera y pie
- **Cabecera** (todas las páginas salvo `/dev`): marca, Villas, Servicios, Grupos, Invierno, Contacto, selector de idioma; menú desplegable en móvil (foco atrapado, Escape cierra). Transparente sobre las escenas oscuras, cal en el resto.
- **Pie**: marca, contacto de `site.ts`, enlaces a todas las páginas, condiciones y normas, e inscripción turística por villa (marcada como pendiente mientras falte).
- **404** (`not-found` por idioma): titular serif, enlace al inicio y al listado de villas.
- **Saltar la intro** (inicio): botón "Saltar intro" visible desde el primer fotograma y tecla Escape; lleva directamente al mapa del conjunto. Se recuerda en `sessionStorage` durante la sesión. Con `prefers-reduced-motion` la intro ya empieza saltada.
- **Listado de villas** (`/villas`): tarjeta por villa (portada en arco, plazas 15, dormitorios con su marca de pendiente, baños, m², "desde" de `tarifas.ts`, rasgo destacado) → página de villa. Es también la lista alternativa accesible del mapa (§3.5).
- **Servicios** (`/servicios`): la lista con previsualización de la §2.7 a tamaño de página, con precios de `servicios.ts`, menús del chef, lista del pack desayuno (marcada como pendiente) y "Solicitar" en el catamarán (→ contacto con el asunto rellenado).
- **Grupos** (`/grupos`): villas 4 + 5 contiguas, hasta 30 huéspedes (15 + 15), fotos de ambas y formulario de solicitud: fechas, nº de huéspedes (16–30), motivo (familia, celebración, empresa…), contacto y comentarios. Sin precio cerrado; como mucho, "desde" de cada villa.
- **Invierno** (`/invierno`): estancias largas de diciembre a marzo (> 28 noches), ventajas (limpieza cada 2 días, clima) y formulario: villa (o "cualquiera"), fechas aproximadas, nº de huéspedes, contacto y comentarios. Acepta villa y fechas por query desde la reserva.
- **Condiciones de reserva** (`/condiciones`) y **normas de la casa** (`/normas`): textos adaptados de la web antigua (SPEC §7), marcados para revisión. Las cifras (pagos, fianza, cancelación, horarios, mascotas, mínimo de noches) se leen de `tarifas.ts` y constantes de `pricing.ts`, nunca se escriben a mano en los mensajes.
- **Contacto** (`/contacto`): email y teléfono de `site.ts` y formulario general (nombre, email, teléfono opcional, villa opcional, asunto, mensaje).

### 8.3 Formularios sin backend
- Interfaz `SolicitudesProvider` en `src/lib/solicitudes/` (como `BookingProvider`): `enviar(solicitud: SolicitudGrupo | SolicitudInvierno | SolicitudContacto): Promise<ResultadoSolicitud>`. Implementación `MockSolicitudesProvider`: espera corta, devuelve referencia y no guarda nada. El frontend solo usa la interfaz; en el futuro, una implementación que envíe por email (route handler + proveedor de correo).
- Validación pura y testeada en `src/lib/validation/formularios.ts`, compartida por los formularios y el paso 4 de la reserva; errores como códigos con texto en mensajes. Errores junto a cada campo, foco al primero erróneo y resumen con `aria-live`.
- Tras enviar: mensaje de "Solicitud recibida" con la referencia y un aviso de demo; el formulario se vacía. Protección contra doble envío.

### 8.4 Ficha clásica y secciones editoriales (página de villa)
Lo que falta de la §2.8: editoriales ("Un día en Puerto Banús", "Para grupos" → `/grupos`, "Invierno" → `/invierno`) con textos marcados para revisión, y la ficha clásica: descripción, comodidades, distribución de camas (`dormitorios.ts`, con sus discrepancias marcadas), resumen de normas (→ `/normas`), ubicación (pendiente de coordenadas: solo texto de zona) y la sección "Reservar" (§8.1). Reseñas ocultas hasta tenerlas.

### 8.5 Réplica de las villas 1, 3 y 5 — lo que haces tú
**Cuándo**: después de cerrar M6 (prototipo de la Villa 4 validado: ids de zonas, convención de estancias y aspecto ya fijados) y **antes de empezar M12**. Al abrir M12 paro y te pido que lo hagas; mientras tanto puedo seguir con M9–M11. El orden por villa es el de la lista (las fotos se asignan a estancias que ya existen).

Para cada villa (villa-1, villa-3, villa-5):
1. **`/dev/zonas` → portada** (villa-1 `villa1_012`, villa-3 `villa3_019`, villa-5 `villa5_002`): dibujar `jardin` (acción galería, destino `jardin`), `planta-baja` y `planta-alta` (acción planta). Ids exactos como en la Villa 4. Si una zona no se ve en la portada (p. ej. el jardín en la foto de dron de villa-3), dímelo y valoramos cambiar de portada.
2. **`/dev/zonas` → plano de planta baja** y **plano de planta alta**: un polígono por estancia (dormitorios, baños, salón, cocina, comedor, porche…). Los dormitorios con el **mismo id que en `dormitorios.ts`** (`pb-suite-doble`, `pa-twin`…), para que el panel muestre sus camas; el editor avisa si no cuadra.
3. **`/dev/zonas` → aérea del conjunto**: solo si la parcela de esa villa no quedó dibujada en la Fase 2.
4. **`/dev/fotos`**: arrastrar las fotos a cada estancia y a cada exterior (jardín, piscina, porche, barbacoa, terraza) y marcar la principal de cada una. Revisar antes las de baja confianza de `docs/fotos-resumen.md`.
5. **Decidir y decírmelo en el chat** (no hay herramienta): las 5 estancias de las tarjetas en arco (`destacadas`) y, si hay fotos con encuadre útil, puerta y recibidor para "Entrar en la casa" (si no, esa sección se omite en esa villa).
6. **Resolver** lo de `docs/pendientes.md` que afecte a la villa: dormitorios de villa-1 (6 o 7) y discrepancias de camas (villa-3 `pb-sala`, suites dudosas).

Lo que hago yo en M12: integrar esos JSON, validar con `validarVilla()`, revisar cada villa en el navegador y anotar lo que falte, sin rellenar huecos con datos inventados.

### 8.6 Revisión final rápida (móvil e inglés)
Con Chrome DevTools, a 375 px y 768 px y en escritorio, en `es` y `en`: todas las rutas (incluida la 404), cabecera y pie, saltar intro, mapa y explorador por toque, reserva completa hasta la confirmación, los 4 formularios (errores y envío) y `prefers-reduced-motion`. En inglés: textos desbordados o cortados, claves sin traducir, formato de fechas e importes (`en-GB`). Resultado: lista de fallos → issues S de corrección.

### 8.7 Milestones propuestos (se crean con `/milestone` al llegar)
- **M9 Estructura común**: cabecera y menú móvil · pie · 404 por idioma · saltar intro · `SolicitudesProvider` + mock + validación de formularios · página de contacto.
- **M10 Páginas de contenido**: listado de villas · servicios · grupos (formulario) · invierno (formulario, con query de la reserva) · condiciones · normas · ficha clásica y editoriales en la página de villa (§8.4, sin la reserva).
- **M11 Reserva simulada** (*cambia el modelo de datos: OK previo*): ampliación de `BookingProvider` y del mock (§8.1) · calendario con ocupados · pasos huéspedes/extras y desglose · datos del cliente · pago simulado · página de confirmación.
- **M12 Réplica villas 1, 3 y 5** (*bloqueado hasta que completes la §8.5*): un issue por villa (integración de zonas, estancias, fotos, destacadas y recorrido; validación; revisión visual).
- **M13 Revisión final**: pasada de la §8.6 y correcciones resultantes.
