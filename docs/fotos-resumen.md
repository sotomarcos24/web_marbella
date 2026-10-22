# Catálogo de fotos — resumen (#15)

Clasificación automática (un subagente por villa) revisada a mano. Fuente de verdad: `src/content/fotos.ts`; exclusiones y recortes en `scripts/photos.config.ts`. Los dormitorios usan los ids de `src/content/dormitorios.ts` (ficha, sin contrastar con los planos), así que casi todos van con confianza baja: se confirman en `/dev/fotos` (#18).

## Tabla por villa

| Villa | Fotos | Int. / Ext. | salon | cocina | comedor | dormitorio | bano | piscina | jardin | porche | barbacoa | terraza | fachada | vistas | detalle | Baja conf. | Descartadas |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| villa-1 | 51 | 35 / 16 | 7 | 5 | 3 | 6 | 3 | 3 | 1 | 3 | 1 | 2 | 3 | 0 | 14 | 16 | 13 |
| villa-3 | 62 | 41 / 21 | 4 | 2 | 1 | 14 | 7 | 3 | 3 | 6 | 0 | 1 | 1 | 1 | 19 | 29 | 3 |
| villa-4 | 64 | 45 / 19 | 4 | 2 | 3 | 14 | 6 | 2 | 1 | 6 | 0 | 0 | 3 | 0 | 23 | 23 | 7 |
| villa-5 | 57 | 40 / 17 | 6 | 4 | 7 | 9 | 7 | 0 | 1 | 4 | 0 | 0 | 10 | 0 | 9 | 15 | 9 |

Descartadas incluye el duplicado villa1_039 (= villa1_012). No cuenta los planos (`plano-planta-{baja,alta}.webp`) ni el mapa aéreo (pendiente de edición, Fase 3).

## Fotos de baja confianza

- **villa-1**: villa1_006 (detalle → pa-suite-2), villa1_023 (dormitorio → pb-triple), villa1_028 (dormitorio → pa-twin), villa1_029 (detalle → pa-twin), villa1_033 (detalle → comedor), villa1_035 (salon → salon), villa1_043 (detalle → pa-suite-1), villa1_044 (dormitorio → pa-suite-1), villa1_045 (detalle → pa-suite-1), villa1_051 (dormitorio → pb-suite-doble), villa1_053 (dormitorio → pb-triple), villa1_054 (dormitorio → pb-triple), villa1_055 (detalle → pb-triple), villa1_068 (salon → recibidor), villa1_069 (salon → recibidor), villa1_070 (salon → recibidor)
- **villa-3**: villa3_008 (dormitorio → pa-doble), villa3_009 (dormitorio → pa-triple), villa3_012 (dormitorio → pa-suite-1), villa3_013 (detalle → pa-suite-1), villa3_020 (dormitorio → pa-suite-2), villa3_021 (detalle → pa-doble), villa3_022 (detalle → pa-triple), villa3_025 (detalle → pa-triple), villa3_026 (dormitorio → pa-suite-1), villa3_028 (detalle → pa-suite-1), villa3_032 (bano → bano-3), villa3_036 (dormitorio → pa-suite-2), villa3_039 (detalle → pa-suite-2), villa3_041 (dormitorio → pb-suite-twin), villa3_042 (dormitorio → pb-suite-twin), villa3_043 (detalle → bano-4), villa3_044 (dormitorio → pb-suite-doble), villa3_045 (dormitorio → pa-triple), villa3_046 (bano → bano-4), villa3_047 (dormitorio → pa-suite-2), villa3_048 (dormitorio → pb-sala), villa3_049 (bano → bano-5), villa3_050 (dormitorio → pb-suite-doble), villa3_051 (detalle → bano-5), villa3_066 (detalle), villa3_067 (detalle), villa3_068 (dormitorio → pa-suite-1), villa3_069 (detalle → pa-doble), villa3_071 (bano → bano-3)
- **villa-4**: villa4_003 (dormitorio → pb-triple), villa4_014 (dormitorio → pa-doble), villa4_026 (detalle → pa-suite-1), villa4_035 (detalle → pa-doble), villa4_036 (dormitorio → pa-suite-2), villa4_037 (dormitorio → pa-suite-1), villa4_038 (dormitorio → pb-twin), villa4_045 (bano → bano-2), villa4_048 (detalle), villa4_049 (dormitorio → pb-triple), villa4_050 (detalle → pa-suite-1), villa4_051 (dormitorio → pa-suite-1), villa4_053 (dormitorio → pa-suite-2), villa4_054 (detalle → bano-2), villa4_055 (detalle → bano-2), villa4_068 (detalle), villa4_070 (dormitorio → pa-suite-1), villa4_071 (dormitorio → pa-doble), villa4_072 (bano → bano-2), villa4_074 (dormitorio → pa-triple), villa4_076 (dormitorio → pa-doble), villa4_077 (detalle → pb-triple), villa4_079 (detalle → pa-suite-2)
- **villa-5**: villa5_019 (dormitorio → pa-suite-2), villa5_031 (detalle), villa5_039 (dormitorio → pa-suite-1), villa5_040 (detalle → pa-suite-1), villa5_043 (dormitorio → pa-suite-2), villa5_044 (bano → bano-2), villa5_045 (dormitorio → pa-suite-2), villa5_047 (detalle → pa-triple), villa5_050 (dormitorio → pa-triple), villa5_052 (dormitorio → pb-triple), villa5_053 (dormitorio → pb-twin), villa5_055 (bano → bano-3), villa5_066 (dormitorio → pa-suite-1), villa5_067 (detalle → pa-suite-2), villa5_076 (detalle)
## Portadas y día/noche
- Portadas provisionales: villa1_012, villa3_019, villa4_059, villa5_002 (catalogadas y presentes en `public/`).
- **No hay nocturna con el mismo encuadre que ninguna portada**, así que `hero.imagenNoche` sigue vacío. Las más próximas, por si se generan con IA o se recortan:
  - villa-1: villa1_001 (misma fachada desde la piscina, pero formato cuadrado y antes llevaba el sello); 013 y 071 son la misma escena más abierta.
  - villa-4: villa4_017 y villa4_083 (fachada de arcos desde el jardín, con otro punto de vista).
  - villa-5: villa5_009 y villa5_001 (fachada frontal desde el jardín; la portada 002 es una toma de dron).
  - villa-3: ninguna foto nocturna.

## Sello "Heated Pool"
Solo en los `_001`: se recorta la franja inferior (sin el sello; verificado visualmente).

## Decisiones a revisar
- **Tarjetas de bienvenida** (regla de la SPEC): fuera 18 fotos (casi todas de dormitorios). Las marcadas como "retocable" en `photos.config.ts` se podrían recuperar borrando la tarjeta: villa1_005/007/022/046/048/056 y villa5_007/014/016/038/051/054.
- **Etiquetas de productos de terceros** (cava, vino, velas, logos del horno y un rótulo de hotel al fondo): se mantienen porque no están en la lista de la SPEC: villa1_016/060, villa3_027/061, villa4_030/046/060.
