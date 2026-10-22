import type { Conjunto, Poligono, Villa, Zona } from "@/types/villa";

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

export function validarVilla(villa: Villa, contexto: { conjunto?: Conjunto } = {}): string[] {
  const { hero, plantas, exteriores, recorrido = [], destacadas = [] } = villa;
  const plantaIds = plantas.map((planta) => planta.id);
  const estanciaIds = plantas.flatMap((planta) => planta.estancias.map((estancia) => estancia.id));
  const exteriorIds = exteriores.map((exterior) => exterior.id);
  const idsEstancias = new Set(estanciaIds);
  const destinos = {
    planta: { ids: new Set(plantaIds), esperado: "una planta" },
    galeria: { ids: new Set([...exteriorIds, ...estanciaIds]), esperado: "un exterior o estancia" },
  } satisfies Record<Zona["accion"], { ids: Set<string>; esperado: string }>;

  const errores = [
    ...idsRepetidos(hero.zonas.map((zona) => zona.id), "hero.zonas"),
    ...idsRepetidos(plantaIds, "plantas"),
    ...idsRepetidos(estanciaIds, "estancias"),
    ...idsRepetidos(exteriorIds, "exteriores"),
    ...idsRepetidos(recorrido.map((tramo) => tramo.id), "recorrido"),
    ...idsRepetidos(destacadas, "destacadas"),
  ];

  hero.zonas.forEach((zona, i) => {
    const ruta = `hero.zonas[${i}]`;
    errores.push(...validarPoligono(zona.poligono, `${ruta}.poligono`));
    const { ids, esperado } = destinos[zona.accion];
    if (!ids.has(zona.destino)) {
      errores.push(`${ruta}: el destino "${zona.destino}" no es ${esperado} de la villa`);
    }
  });

  plantas.forEach((planta, p) => {
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

/** Polígonos válidos y una sola parcela por villa. */
export function validarConjunto(conjunto: Conjunto): string[] {
  return [
    ...idsRepetidos(conjunto.parcelas.map((parcela) => parcela.villaId), "conjunto.parcelas"),
    ...conjunto.parcelas.flatMap((parcela, i) => validarPoligono(parcela.poligono, `conjunto.parcelas[${i}].poligono`)),
  ];
}
