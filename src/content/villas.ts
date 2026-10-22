import type { Exterior, Hero, Pendiente, Planta, Poligono, Villa, VillaId } from "@/types/villa";

// SPEC §6. Datos sin confirmar van vacíos y marcados en `pendientes`; nunca se inventan.
// Portadas, planos y polígonos son provisionales hasta procesar las fotos reales.

const pendientesComunes: readonly Pendiente[] = [
  { campo: "inscripcionTuristica", nota: "pendiente de recibir el número de inscripción turística" },
  { campo: "coordenadas", nota: "pendiente de obtener las coordenadas" },
];

const poligonoJardin: Poligono = [[0.05, 0.6], [0.45, 0.6], [0.45, 0.95], [0.05, 0.95]];
const poligonoPlantaBaja: Poligono = [[0.3, 0.45], [0.7, 0.45], [0.7, 0.7], [0.3, 0.7]];
const poligonoPlantaAlta: Poligono = [[0.3, 0.2], [0.7, 0.2], [0.7, 0.45], [0.3, 0.45]];

const hero = (villa: VillaId, portada: string): Hero => ({
  imagenDia: `/images/villas/${villa}/${portada}.webp`,
  zonas: [
    { id: "jardin", nombre: "zonas.jardin", poligono: poligonoJardin, accion: "galeria", destino: "jardin" },
    { id: "planta-baja", nombre: "zonas.planta-baja", poligono: poligonoPlantaBaja, accion: "planta", destino: "planta-baja" },
    { id: "planta-alta", nombre: "zonas.planta-alta", poligono: poligonoPlantaAlta, accion: "planta", destino: "planta-alta" },
  ],
});

const exteriores: readonly Exterior[] = [{ id: "jardin", fotos: [] }];

const plantas = (villa: VillaId): readonly Planta[] => [
  { id: "planta-baja", nombre: "zonas.planta-baja", imagenPlano: `/images/villas/${villa}/plano-planta-baja.webp`, estancias: [] },
  { id: "planta-alta", nombre: "zonas.planta-alta", imagenPlano: `/images/villas/${villa}/plano-planta-alta.webp`, estancias: [] },
];

export const villas: readonly Villa[] = [
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
    exteriores,
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
    exteriores,
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
    pendientes: pendientesComunes,
    hero: hero("villa-4", "villa4_059"),
    plantas: plantas("villa-4"),
    exteriores,
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
    exteriores,
  },
];
