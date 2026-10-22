# SPEC — Soto Village Marbella (frontend)

Web de alquiler vacacional de 4 villas de lujo en Calle Los Lirios, Puerto Banús (Marbella). **Solo frontend**: sin backend, base de datos, pagos reales, cookies ni SEO. Se ejecuta en local para una demo; el código debe servir para producción (limpio y modular). Trabajo por fases; esta especificación cubre la **Fase 1** (cimientos + herramientas internas). No se construyen aún las páginas finales ni el explorador visual.

## 1. Stack
Next.js (App Router) + TypeScript estricto + Tailwind CSS · next-intl (es por defecto, en; todos los textos en archivos de traducción) · Motion y Lenis instalados y configurados · Vitest · última versión estable de cada librería.

## 2. Marca
`src/config/site.ts`: nombre "Soto Village Marbella", email y teléfono de ejemplo. El nombre solo se escribe ahí.

## 3. Sistema de diseño (mediterráneo cálido, provisional)
Colores: cal #F7F2EA (fondo), arena #E6D3B3, terracota #C2603E (acento), oliva #6B7350, mar #1F3A4D, tinta #2B2420. Serif con carácter para títulos (Fraunces o Cormorant Garamond) y sans limpia para texto (DM Sans o Inter). Página `/dev/estilos` que lo muestra todo.

## 4. Estructura de la web (solo para diseñar el modelo de datos)
- **Inicio**: cabecera (marca, Villas, Ubicación, Servicios, Contacto, selector de idioma). Centro: mapa aéreo del conjunto con cada villa pinchable → página de la villa.
- **Página de villa**: arriba, foto grande (vista aérea inclinada o fachada) con ZONAS interactivas: `jardin` (abre fotos del jardín), `planta-baja` y `planta-alta` (van al plano de esa planta). Al pasar el ratón, la zona se oscurece ligeramente. Botón "Ver todas las fotos". Botón día/noche si hay versión nocturna. Puede haber vídeo en bucle en lugar de foto (cámara fija; mismas zonas). Debajo: descripción, comodidades, distribución de camas, normas, ubicación, reseñas y reserva.
- **Plano de planta**: imagen del plano con cada estancia pinchable → panel con sus fotos y datos.

## 5. Modelo de datos (`src/content/`)
Zonas y estancias como POLÍGONOS en coordenadas normalizadas (0–1) sobre su imagen.
- `villa.hero`: `{ imagenDia, imagenNoche?, video?, zonas: [{ id, nombre, poligono, accion: 'galeria' | 'planta', destino }] }`
- `villa.plantas`: `[{ id, nombre, imagenPlano, estancias: [{ id, nombre, tipo, poligono, fotos[], camas?, banoEnSuite?, medidas? }] }]`
- `villa.exteriores`: `[{ id: jardin | piscina | porche | barbacoa | terraza…, fotos[] }]`
- Portadas provisionales: villa-3 → villa3_019 (dron); villa-5 → villa5_002; villa-1 → villa1_012; villa-4 → villa4_059.

## 6. Villas (`villas.ts`)
Plazas máximas: **15 en todas** (tope legal andaluz), aunque la web antigua diga 18–20.
| Villa | Dorm. | Baños | Vivienda | Parcela | Parking | Notas |
|---|---|---|---|---|---|---|
| villa-1 | 7 (pendiente de confirmar: el plano solo muestra 6) | 5 | 299 m² | 941 m² | 1 coche | Piscina climatizable con tobogán |
| villa-3 | 7 | 4 | 350 m² | 844 m² | 4 plazas | Patio con fuente, terraza 76 m² |
| villa-4 | 6 | 4 | 306 m² | 1.213 m² | 3 coches | Jardín llano, escalera de caracol, futbolín |
| villa-5 | 6 | 4 | 321 m² | 1.212 m² | 3 coches | Distribución en espejo de la villa 4 |
Villas 4 y 5 contiguas: campo `combinableCon` (grupos de hasta 30). Pendientes (vacíos y marcados): número de inscripción turística y coordenadas.

## 7. Textos (copiar y adaptar)
Fuentes: fichas holidayfuture (villa-1: listings/78195, villa-3: 63865, villa-4: 63863, villa-5: 63862 en liriosvillagemarbella.holidayfuture.com), y en liriosvillagemarbella.com/es/: booking-conditions, house-rules, services.
Reglas: sustituir "Lirios Village" por la marca; eliminar nombres de personas (Eva, Laura, Iván); capacidad siempre 15; corregir malas traducciones ("mucama" → limpieza); ES y EN bien escritos; omitir normas de apartamentos.

## 8. Tarifas (`tarifas.ts`) — € por noche con IVA, según el mes de cada noche
| Mes | villa-1 | villa-3 | villa-4 y 5 |
|---|---|---|---|
| Ene | 616 | 616 | 560 |
| Feb | 616 | 616 | 560 |
| Mar | 989 | 989 | 924 |
| Abr | 1456 | 1456 | 1344 |
| May | 1568 | 1568 | 1512 |
| Jun | 1344 | 1120 | 1624 |
| Jul | 2016 | 1792 (estimado: true) | 1680 |
| Ago | 2016 | 1792 | 1680 |
| Sep | 1568 | 1568 | 1512 |
| Oct | 1232 | 1232 | 1064 |
| Nov | 1064 | 650 | 591 |
| Dic | 538 | 653 | 523 |

Reglas:
- Estancia de 3 a 59 noches. Más de 28 noches entre diciembre y marzo → "Solicita oferta de estancia de invierno" en lugar de precio.
- Entrada 16:00, salida 10:00.
- Limpieza final 450 €. Limpieza cada 2 días incluida (destacarla).
- Suplemento por huésped del 13.º al 15.º, por persona y estancia: villa-4 y villa-5 150 €; villa-1 250 € en agosto; resto 150 € (estimado).
- Fianza 1.000 €, preautorizada en tarjeta antes de la entrada y devuelta en 2 días tras la salida; mostrada aparte del total.
- Pagos: 25 % al reservar y 75 % 30 días antes de la llegada (100 % si faltan menos de 30 días).
- Cancelación gratuita hasta 60 días antes (cargo bancario 2 %); después, sin reembolso. Mostrar la fecha límite concreta.
- Mascotas: 200 € por mascota.

## 9. Servicios (`servicios.ts`) — SOLO estos
- Chef privado "Julio" (mínimo 10 comensales). Menú paella 55 €/adulto, 30 €/niño; menú barbacoa 55 €/adulto, 25 €/niño. Copiar los menús. Presentación genérica: NO copiar la biografía del chef actual.
- Limpieza diaria (mejora sobre la de cada 2 días): 125 €/día, PROVISIONAL. Cambio extra de ropa de cama y toallas: 130 €.
- Compra antes de llegar: 80 € de gestión hasta 200 € de compra, +40 € por cada 100 € más; el ticket se paga aparte.
- Pack desayuno de llegada (unas 8 personas): 90 €, con su lista.
- Decoración de bienvenida: 95 €.
- Catamarán privado, 4 h: bajo presupuesto ("Solicitar").
- Calefacción de piscina: 90 €/día.
NO incluir traslados, despedidas, fotos ni spa.

## 10. Calculadora (`src/lib/pricing.ts`) + tests Vitest
Función pura: recibe villa, entrada, salida, huéspedes, mascotas y extras; devuelve precio de cada noche (aunque cruce meses), alojamiento, limpieza final, suplementos, extras, total con IVA, fianza aparte, calendario de pagos con fechas, fecha límite de cancelación, avisos y errores.
Tests mínimos:
- villa-4, 3 noches de agosto, 10 huéspedes → 5.490 €; 25 % = 1.372,50 €
- villa-1, 30 jun → 3 jul → 5.826 €
- villa-4, 14 huéspedes, 3 noches de agosto → +300 €
- 2 noches → error de estancia mínima
- 16 huéspedes → error de capacidad
- llegada dentro de 20 días → 100 % al reservar

## 11. Reservas simuladas (`src/lib/booking/`)
Interfaz `BookingProvider` (disponibilidad, cotización, crear reserva) e implementación `MockBookingProvider` con fechas ocupadas inventadas en un JSON. El frontend solo usa la interfaz (futuro: Hostaway + Stripe).

## 12. Fotos
- **Origen**: carpeta `imgs/` que aportará el usuario (subcarpetas villa1, villa3, villa4, villa5; imágenes limpias, sin marca de agua). No mover ni modificar originales. Ignorar "fotos con personas" y cualquier carpeta "movimiento". *(Hasta que llegue, el pipeline se desarrolla con fixtures sintéticos.)*
- Apartar y NO usar: rótulo 5G, cartel "Guest services", mapa de ubicación con distancias, MAPA AÉREO DEL CONJUNTO (se edita aparte; llegará más tarde), cartas de bienvenida, placa con logo.
- Portadas con sello "Heated Pool" (`_001` de cada villa): recortar el sello si es posible sin estropear la foto; si no, marcar como descartada.
- Planos (villa1_027, villa3_029, villa4_025, villa5_024): separar en una imagen por planta (baja con jardín / alta), sin logo, dirección ni texto legal.
- Convertir a WebP optimizado en `public/images/villas/<villa>/` y generar `fotos.ts` con: villa, archivo, zona (interior/exterior), tipo (salon, cocina, comedor, dormitorio, bano, piscina, jardin, porche, barbacoa, terraza, fachada, vistas, detalle), estanciaSugerida (p. ej. "dormitorio-2"), confianza (alta/baja), alt ES y EN.
- Al final: tabla resumen por villa y lista de fotos de baja confianza.

## 13. Herramientas internas (solo en /dev, no se publican)
- `/dev/zonas`: elegir imagen (portada o plano), clic para dibujar vértices de un polígono, id y nombre, editar y borrar, exportar/guardar JSON en `src/content`.
- `/dev/fotos`: por villa, a la izquierda estancias y exteriores; a la derecha miniaturas. Arrastrar fotos a cada estancia (se guarda en `src/content`) y marcar la foto principal de cada estancia.
- `/dev/cotizador`: villa, fechas, huéspedes y extras → desglose de la calculadora.

## 14. Flujo de trabajo
Según CLAUDE.md: milestones e issues en GitHub (repo https://github.com/sotomarcos24/web_marbella), tests primero, revisión por `qa-reviewer`, máx. 3 rondas, aprobación del usuario para el desglose y antes del merge.
