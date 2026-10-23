# Pendientes

Datos y recursos que faltan al cerrar la Fase 1. Nunca se inventan: quedan vacíos o marcados en el código hasta tenerlos.

| Pendiente | Estado actual | Dónde está marcado | Lo necesita |
|---|---|---|---|
| Inscripción turística | Vacía en las 4 villas | `src/content/villas.ts` (`pendientes`) | Ficha de villa (Fase 2) |
| Coordenadas | Vacías en las 4 villas | `src/content/villas.ts` (`pendientes`) | Ubicación en la ficha (Fase 2) |
| Dormitorios de villa-1 | 7 según la ficha; el plano muestra 6 | `src/content/villas.ts` (`pendientes`) | Ficha de villa-1 |
| Distribución de camas | Tomada de las fichas, sin contrastar con los planos | `src/content/dormitorios.ts` (`estado`) | Ficha de villa (Fase 2) |
| Aérea limpia del conjunto | El mapa aéreo tiene marcadores y logo: apartado como "pendiente de edición" | `scripts/photos.config.ts` (`pendientesEdicion`) | Llegada de T1 y parcelas (Fase 3) |
| Vídeos de transición | Sin generar; la web usa fundido/zoom como sustituto | `src/content/transiciones.json` (registro, Fase 3) | Transiciones (Fase 3) |
| Acceso a Pletor | El inicio de sesión en el MCP falla; falta un modelo con primer/último fotograma | — | Vídeos de transición (Fase 3) |
| Tarifas estimadas | Julio de villa-3 y suplemento por huésped de villa-3 | `src/content/tarifas.ts` (`estimado: true`) | Calculadora y reserva |
| Limpieza diaria | Precio provisional | `src/content/servicios.ts` (`provisional: true`) | Servicios |
| Pack desayuno | Lista de artículos sin confirmar | `src/content/servicios.ts` (`packDesayuno.pendiente`) | Servicios |
| Foto nocturna | Ninguna villa tiene foto nocturna con el mismo encuadre; el botón día/noche no se muestra | `docs/vision.md` §7 | Explorador de villa (Fase 2) |
| Fotos de servicios | Sin fotos para la previsualización (chef, compra, desayuno, decoración, catamarán) | `docs/vision.md` §7 (`imagenPrevia?`) | Servicios (Fase 4) |
| Textos editoriales | Sin redactar; se marcarán para revisión | `docs/vision.md` §7 | Secciones editoriales |
| Reseñas reales | No hay; la sección queda oculta hasta tenerlas | `docs/vision.md` §7 | Ficha de villa |
| Fotos del fotógrafo profesional | Pendientes; se repetirán las transiciones con el registro de `transiciones.json` | `docs/vision.md` §7 | Versión final |
