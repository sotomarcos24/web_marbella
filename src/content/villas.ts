import { cargarVilla } from "@/lib/content/cargar";
import type { Hero, Pendiente, Planta, Villa, VillaId } from "@/types/villa";

// SPEC §6. Datos sin confirmar van vacíos y marcados en `pendientes`; nunca se inventan.
// Las portadas y los planos son provisionales hasta procesar las fotos reales.

const pendientesComunes: readonly Pendiente[] = [
  { campo: "inscripcionTuristica", nota: "pendiente de recibir el número de inscripción turística" },
  { campo: "coordenadas", nota: "pendiente de obtener las coordenadas" },
];

const hero = (villa: VillaId, portada: string): Hero => ({
  imagenDia: `/images/villas/${villa}/${portada}.webp`,
  zonas: [],
});

const plantas = (villa: VillaId): readonly Planta[] => [
  { id: "planta-baja", nombre: "zonas.planta-baja", imagenPlano: `/images/villas/${villa}/plano-planta-baja.webp`, estancias: [] },
  { id: "planta-alta", nombre: "zonas.planta-alta", imagenPlano: `/images/villas/${villa}/plano-planta-alta.webp`, estancias: [] },
];

const base: readonly Villa[] = [
  {
    id: "villa-1",
    plazasMax: 15,
    dormitorios: 7,
    banos: 5,
    superficieVivienda: 299,
    superficieParcela: 941,
    parking: 1,
    pendientes: [
      { campo: "dormitorios", nota: "pendiente de confirmar (el plano muestra 6)" },
      ...pendientesComunes,
    ],
    hero: hero("villa-1", "villa1_012"),
    plantas: plantas("villa-1"),
    exteriores: [],
  },
  {
    id: "villa-3",
    plazasMax: 15,
    dormitorios: 7,
    banos: 4,
    superficieVivienda: 350,
    superficieParcela: 844,
    parking: 4,
    pendientes: pendientesComunes,
    hero: hero("villa-3", "villa3_019"),
    plantas: plantas("villa-3"),
    exteriores: [],
  },
  {
    id: "villa-4",
    plazasMax: 15,
    dormitorios: 6,
    banos: 4,
    superficieVivienda: 306,
    superficieParcela: 1213,
    parking: 3,
    combinableCon: ["villa-5"],
    pendientes: [
      ...pendientesComunes,
      { campo: "hero.zonas-provisionales", nota: "borrador del agente (zonas, estancias y parcela): ajustar en /dev/zonas" },
      { campo: "fotos-provisionales", nota: "borrador del agente a partir de las sugerencias del catálogo: revisar en /dev/fotos" },
    ],
    hero: hero("villa-4", "villa4_059"),
    plantas: plantas("villa-4"),
    exteriores: [],
    // Salón, cocina, dormitorio principal, baño y porche (provisional).
    destacadas: ["salon", "cocina", "pa-suite-1", "bano-1", "porche"],
    // Puerta → recibidor → salón. Encuadre: banda 16:9 de las fotos verticales con la puerta y la escalera
    // enteras (la parte alta de la escalera se pierde), el mismo recorte previsto para T3/T4 en la Fase 3.
    recorrido: [
      {
        id: "t3",
        transicion: "villa-4-t3",
        inicio: "/images/villas/villa-4/villa4_078.webp",
        imagenFinal: "/images/villas/villa-4/villa4_044.webp",
        titularKey: "recorrido.bienvenida",
        encuadre: "50% 55%",
      },
      {
        id: "t4",
        transicion: "villa-4-t4",
        inicio: "/images/villas/villa-4/villa4_044.webp",
        imagenFinal: "/images/villas/villa-4/villa4_022.webp",
        encuadre: "50% 55%",
      },
    ],
  },
  {
    id: "villa-5",
    plazasMax: 15,
    dormitorios: 6,
    banos: 4,
    superficieVivienda: 321,
    superficieParcela: 1212,
    parking: 3,
    combinableCon: ["villa-4"],
    pendientes: pendientesComunes,
    hero: hero("villa-5", "villa5_002"),
    plantas: plantas("villa-5"),
    exteriores: [],
  },
];

// Zonas, estancias y fotos salen de los JSON que guardan /dev/zonas y /dev/fotos (solo servidor).
export const villas: readonly Villa[] = base.map((villa) => cargarVilla(villa));
