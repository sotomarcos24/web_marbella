import type { AccionZona, Conjunto, Poligono, Villa, VillaId, Zona } from "@/types/villa";

// Los validadores devuelven la lista de errores, cada uno con su ruta en el objeto; [] = válido.

/** Mínimo 3 vértices y coordenadas finitas dentro de [0,1]. */
export function validarPoligono(poligono: Poligono, ruta: string): string[] {
  const errores: string[] = [];
  if (poligono.length < 3) {
    errores.push(`${ruta}: necesita al menos 3 vértices (tiene ${poligono.length})`);
  }
  poligono.forEach(([x, y], i) => {
    if (![x, y].every((c) => Number.isFinite(c) && c >= 0 && c <= 1)) {
      errores.push(`${ruta}[${i}]: coordenadas fuera de [0,1] (${x}, ${y})`);
    }
  });
  return errores;
}

/** Errores por cada id que aparece más de una vez. */
function idsRepetidos(ids: readonly string[], ruta: string): string[] {
  const repetidos = new Set(ids.filter((id, i) => ids.indexOf(id) !== i));
  return [...repetidos].map((id) => `${ruta}: id "${id}" repetido`);
}

const vacio = (valor: string) => valor.trim() === "";

/** Errores por cada id o nombre vacío. */
function camposVacios(elementos: readonly { id: string; nombre: string }[], ruta: string): string[] {
  return elementos.flatMap(({ id, nombre }, i) => [
    ...(vacio(id) ? [`${ruta}[${i}]: id vacío`] : []),
    ...(vacio(nombre) ? [`${ruta}[${i}]: nombre vacío`] : []),
  ]);
}

/** Ids a los que puede llevar una zona según su acción: plantas ("planta"), exteriores o estancias ("galeria"). */
export function destinosZona(villa: Villa): Record<AccionZona, ReadonlySet<string>> {
  const { plantas, exteriores } = villa;
  return {
    planta: new Set(plantas.map((planta) => planta.id)),
    galeria: new Set([...exteriores.map((exterior) => exterior.id), ...plantas.flatMap((planta) => planta.estancias.map((estancia) => estancia.id))]),
  };
}

const DESTINO_ESPERADO: Record<AccionZona, string> = { planta: "una planta", galeria: "un exterior o estancia" };

/** Zonas clicables sobre una imagen de la villa (cabecera o imagen final de una transición). */
export function validarZonas(zonas: readonly Zona[], villa: Villa, ruta: string): string[] {
  const destinos = destinosZona(villa);
  const errores = [...idsRepetidos(zonas.map((zona) => zona.id), ruta), ...camposVacios(zonas, ruta)];
  zonas.forEach((zona, i) => {
    errores.push(...validarPoligono(zona.poligono, `${ruta}[${i}].poligono`));
    if (!destinos[zona.accion].has(zona.destino)) {
      errores.push(`${ruta}[${i}]: el destino "${zona.destino}" no es ${DESTINO_ESPERADO[zona.accion]} de la villa`);
    }
  });
  return errores;
}

export function validarVilla(villa: Villa, contexto: { conjunto?: Conjunto } = {}): string[] {
  const { hero, plantas, exteriores, recorrido = [], destacadas = [] } = villa;
  const plantaIds = plantas.map((planta) => planta.id);
  const estanciaIds = plantas.flatMap((planta) => planta.estancias.map((estancia) => estancia.id));
  const exteriorIds = exteriores.map((exterior) => exterior.id);
  const idsEstancias = new Set(estanciaIds);

  const errores = [
    ...validarZonas(hero.zonas, villa, "hero.zonas"),
    ...idsRepetidos(plantaIds, "plantas"),
    ...idsRepetidos(estanciaIds, "estancias"),
    ...idsRepetidos(exteriorIds, "exteriores"),
    ...idsRepetidos(recorrido.map((tramo) => tramo.id), "recorrido"),
    ...idsRepetidos(destacadas, "destacadas"),
  ];

  plantas.forEach((planta, p) => {
    errores.push(...camposVacios(planta.estancias, `plantas[${p}].estancias`));
    planta.estancias.forEach((estancia, e) => {
      errores.push(...validarPoligono(estancia.poligono, `plantas[${p}].estancias[${e}].poligono`));
    });
  });

  for (const id of new Set(destacadas)) {
    if (!idsEstancias.has(id)) {
      errores.push(`destacadas: "${id}" no es una estancia de la villa`);
    }
  }

  recorrido.forEach((tramo, i) => {
    if (vacio(tramo.transicion)) errores.push(`recorrido[${i}]: transicion vacía`);
    if (vacio(tramo.imagenFinal)) errores.push(`recorrido[${i}]: imagenFinal vacía`);
  });

  if (contexto.conjunto) {
    const parcelas = contexto.conjunto.parcelas.filter((parcela) => parcela.villaId === villa.id);
    if (parcelas.length !== 1) {
      errores.push(`conjunto: ${villa.id} debe tener exactamente una parcela (tiene ${parcelas.length})`);
    }
    parcelas.forEach((parcela) => errores.push(...validarPoligono(parcela.poligono, `conjunto.parcelas[${villa.id}].poligono`)));
  }

  return errores;
}

/** Polígonos válidos y una sola parcela por villa; con `villaIds`, además, solo villas existentes. */
export function validarConjunto(conjunto: Conjunto, villaIds?: readonly VillaId[]): string[] {
  return [
    ...idsRepetidos(conjunto.parcelas.map((parcela) => parcela.villaId), "conjunto.parcelas"),
    ...conjunto.parcelas.flatMap(({ villaId }, i) => (villaIds && !villaIds.includes(villaId) ? [`conjunto.parcelas[${i}]: "${villaId}" no es una villa`] : [])),
    ...conjunto.parcelas.flatMap((parcela, i) => validarPoligono(parcela.poligono, `conjunto.parcelas[${i}].poligono`)),
  ];
}
