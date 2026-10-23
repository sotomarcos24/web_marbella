# Pendientes

Datos y recursos que faltan al cerrar la Fase 1. Nunca se inventan: quedan vacíos o marcados en el código hasta tenerlos.

| Pendiente | Estado actual | Dónde está marcado | Lo necesita |
|---|---|---|---|
| Inscripción turística | Vacía en las 4 villas | `src/content/villas.ts` (`pendientes`) | Ficha de villa (Fase 2) |
| Coordenadas | Vacías en las 4 villas | `src/content/villas.ts` (`pendientes`) | Ubicación en la ficha (Fase 2) |
| Dormitorios de villa-1 | 7 según la ficha; el plano muestra 6 rotulados + 1 estancia sin rótulo con baño (ver abajo) | `src/content/villas.ts` (`pendientes`) | Ficha de villa-1 |
| Distribución de camas | Tomada de las fichas; contrastada con los planos, con discrepancias (ver abajo) | `src/content/dormitorios.ts` (`estado`) | Ficha de villa (Fase 2) |
| Aérea limpia del conjunto | El mapa aéreo tiene marcadores y logo: apartado como "pendiente de edición". Edición con IA, **lo primero de la Fase 3** | `scripts/photos.config.ts` (`pendientesEdicion`) | Llegada de T1 y parcelas (Fase 3) |
| Aérea provisional del conjunto | `public/images/conjunto/aerea-provisional.webp`: recorte desenfocado del mapa (sin marcadores, rótulos ni logo legibles; las líneas de las parcelas tampoco se ven). Las parcelas y el resto de villa-4 (zonas, estancias, fotos, `destacadas`) son un borrador del agente | `scripts/aerea-provisional.ts`, `src/content/conjunto.json`, `src/content/zonas/villa-4/`, `src/content/fotos/villa-4.json`, `villas.ts` (`pendientes`) | Ajustar en `/dev/zonas` y `/dev/fotos` (Fase 2); sustituir la aérea en la Fase 3 |
| Vídeos de transición | Sin generar; la web usa fundido/zoom como sustituto | `src/content/transiciones.json` (registro, Fase 3) | Transiciones (Fase 3) |
| Acceso a Pletor | El inicio de sesión en el MCP falla; falta un modelo con primer/último fotograma | — | Vídeos de transición (Fase 3) |
| Tarifas estimadas | Julio de villa-3, suplemento por huésped de villa-3 y de villa-1 fuera de agosto | `src/content/tarifas.ts` (`estimado: true`) | Calculadora y reserva |
| Limpieza diaria | Precio provisional | `src/content/servicios.ts` (`provisional: true`) | Servicios |
| Pack desayuno | Lista de artículos sin confirmar | `src/content/servicios.ts` (`packDesayuno.pendiente`) | Servicios |
| Foto nocturna | Ninguna villa tiene foto nocturna con el mismo encuadre; el botón día/noche no se muestra | `docs/vision.md` §7 | Explorador de villa (Fase 2) |
| Fotos de servicios | Sin fotos para la previsualización (chef, compra, desayuno, decoración, catamarán) | `docs/vision.md` §7 (`imagenPrevia?`) | Servicios (Fase 4) |
| Textos editoriales | Sin redactar; se marcarán para revisión | `docs/vision.md` §7 | Secciones editoriales |
| Reseñas reales | No hay; la sección queda oculta hasta tenerlas | `docs/vision.md` §7 | Ficha de villa |
| Fotos del fotógrafo profesional | Pendientes; se repetirán las transiciones con el registro de `transiciones.json` | `docs/vision.md` §7 | Versión final |

## Camas: ficha frente a planos

Contraste de `src/content/dormitorios.ts` con `public/images/villas/<villa>/plano-planta-{baja,alta}.webp`. Los datos no se han cambiado: solo se documenta. Los planos son ilustrativos (una cama de matrimonio y dos individuales juntas se dibujan igual).

| Villa | Dormitorio (`id`) | Ficha (código) | Plano | Discrepancia |
|---|---|---|---|---|
| villa-1 | `pb-suite-individual` | 1 individual, baño en suite | Estancia **sin rótulo** junto al lavadero, 1 cama y baño (ENS) | El plano no la rotula como dormitorio: explica "6 en el plano / 7 en la ficha" |
| villa-1 | `pb-suite-doble` | 2 individuales unidas, suite | "Bedroom" junto a la cocina: 1 cama doble, ENS y armario | Ninguna |
| villa-1 | `pb-triple` | Doble + individual | "Bedroom" junto al comedor: 2 camas (individual + doble), sin baño propio | Ninguna |
| villa-1 | `pa-suite-1` | Doble + individual, suite | "Master bedroom": doble + individual, ENS | Ninguna |
| villa-1 | `pa-suite-2` | Doble + individual, suite | "Bedroom" izquierdo: doble + individual; el baño ("Bath") está junto a la escalera, sin acceso claro desde el dormitorio | Suite dudosa |
| villa-1 | `pa-twin` | 2 individuales | "Bedroom" superior: 2 individuales, sin baño propio | Ninguna |
| villa-1 | `pa-triple` | Doble + individual, baño compartido | "Bedroom" inferior central: doble + individual, "Bath" contiguo | Ninguna |
| villa-3 | `pb-suite-doble` | Doble, suite | "Bedroom" junto al parking: doble, ENS | Ninguna |
| villa-3 | `pb-suite-twin` | 2 individuales, suite | "Bedroom" junto a la cocina: 2 individuales, ENS | Ninguna |
| villa-3 | `pb-sala` | Sala usada como dormitorio, 3 plazas, sin camas | Rotulada "Bedroom", entre cocina y comedor: doble + individual, vestidor (WIL), sin baño propio | El plano la muestra como dormitorio con camas (doble + individual), no como sala |
| villa-3 | `pa-suite-1` | Doble + individual, suite | "Bedroom" superior izquierdo: individual + doble, ENS contiguo con puerta al distribuidor | Suite dudosa (el ENS parece abrir al distribuidor) |
| villa-3 | `pa-suite-2` | Doble + individual, suite | "Bedroom" superior derecho: doble + individual, ENS | Ninguna |
| villa-3 | `pa-doble` | Doble, baño compartido | "Bedroom" central: doble; "Bath" al lado | Ninguna |
| villa-3 | `pa-triple` | Doble + individual, baño compartido | "Bedroom" inferior: individual + doble | Ninguna |
| villa-4/5 | `pb-twin` | 2 individuales, suite | "Bed 2,0×3,2": 2 individuales, ENS | Ninguna |
| villa-4/5 | `pb-triple` | Doble + individual | "Bed 4,0×5,0": doble + individual, sin baño propio | Ninguna |
| villa-4/5 | `pa-suite-1` | Doble + individual, suite | "Bed 5,6×4,95": doble + individual, ENS y vestidor | Ninguna |
| villa-4/5 | `pa-suite-2` | Doble + individual, suite | "Bed 3,95×4,9": doble + individual; el "Bath" está entre este dormitorio y el de 3,0×3,6 | No es suite en el plano: baño compartido |
| villa-4/5 | `pa-doble` | 2 individuales unidas | "Bed 3,0×3,6": se dibuja como 1 cama doble | Compatible (individuales unidas), sin confirmar |
| villa-4/5 | `pa-triple` | 3 individuales | "Bed 3,05×4,7": 3 individuales; "Bath" junto al distribuidor | Ninguna |
