import type { Camas, DistribucionCamas, Dormitorio, VillaId } from "@/types/villa";

// Fuente: texto "Sleeping arrangements" de las fichas holidayfuture (docs/fuentes/). No contrastado con los planos:
// todo queda pendiente de confirmar. Sin `camas` = camas sin confirmar.

const doble: Camas = { tipo: "doble", cantidad: 1 };
const individual = (cantidad: number): Camas => ({ tipo: "individual", cantidad });

const tripleDobleIndividual = (id: string, planta: "baja" | "alta", extra: Partial<Dormitorio> = {}): Dormitorio => ({
  id,
  planta,
  camas: [doble, individual(1)],
  ...extra,
});

// Villas 4 y 5 (distribución en espejo, SPEC §6).
const villa45: readonly Dormitorio[] = [
  { id: "pb-twin", planta: "baja", camas: [individual(2)], banoEnSuite: true },
  tripleDobleIndividual("pb-triple", "baja"),
  tripleDobleIndividual("pa-suite-1", "alta", { banoEnSuite: true }),
  tripleDobleIndividual("pa-suite-2", "alta", { banoEnSuite: true }),
  { id: "pa-doble", planta: "alta", camas: [individual(2)], unidas: true },
  { id: "pa-triple", planta: "alta", camas: [individual(3)] },
];

const dormitorios: Record<Exclude<VillaId, "villa-4" | "villa-5">, readonly Dormitorio[]> = {
  "villa-1": [
    { id: "pb-suite-individual", planta: "baja", camas: [individual(1)], banoEnSuite: true },
    { id: "pb-suite-doble", planta: "baja", camas: [individual(2)], unidas: true, banoEnSuite: true },
    tripleDobleIndividual("pb-triple", "baja"),
    tripleDobleIndividual("pa-suite-1", "alta", { banoEnSuite: true }),
    tripleDobleIndividual("pa-suite-2", "alta", { banoEnSuite: true }),
    { id: "pa-twin", planta: "alta", camas: [individual(2)] },
    tripleDobleIndividual("pa-triple", "alta", { banoCompartido: true }),
  ],
  "villa-3": [
    { id: "pb-suite-doble", planta: "baja", camas: [doble], banoEnSuite: true },
    { id: "pb-suite-twin", planta: "baja", camas: [individual(2)], banoEnSuite: true },
    // Sala usada como dormitorio entre cocina y salón: la ficha solo da la capacidad.
    { id: "pb-sala", planta: "baja", plazas: 3 },
    tripleDobleIndividual("pa-suite-1", "alta", { banoEnSuite: true }),
    tripleDobleIndividual("pa-suite-2", "alta", { banoEnSuite: true }),
    { id: "pa-doble", planta: "alta", camas: [doble], banoCompartido: true },
    tripleDobleIndividual("pa-triple", "alta", { banoCompartido: true }),
  ],
};

const ficha = (dormitorios: readonly Dormitorio[]): DistribucionCamas => ({
  fuente: "ficha",
  estado: "pendiente de confirmar",
  dormitorios,
});

export const distribucionCamas: Record<VillaId, DistribucionCamas> = {
  "villa-1": ficha(dormitorios["villa-1"]),
  "villa-3": ficha(dormitorios["villa-3"]),
  "villa-4": ficha(villa45),
  "villa-5": ficha(villa45),
};
