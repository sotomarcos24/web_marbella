import { eur } from "@/lib/dinero";
import type { Centimos } from "@/types/dinero";
import type { PrecioServicio, Servicio } from "@/types/servicio";

type Escalonado = Extract<PrecioServicio, { tipo: "escalonado" }>;

const compraPrevia: Escalonado = {
  tipo: "escalonado",
  base: eur(80),
  hasta: eur(200),
  tramo: eur(100),
  incremento: eur(40),
};

/** Gestión de la compra previa (SPEC §9): el ticket de la compra se paga aparte. Cada 100 € más, o fracción, suma 40 €. */
export function calcularCompraPrevia(compra: Centimos): Centimos {
  if (!Number.isInteger(compra) || compra <= 0) throw new Error(`Importe de compra inválido: ${compra}`);
  const { base, hasta, tramo, incremento } = compraPrevia;
  if (compra <= hasta) return base;
  return base + Math.ceil((compra - hasta) / tramo) * incremento;
}

const T = "servicios";

/** Solo los servicios de SPEC §9 (sin traslados, despedidas, fotos ni spa). */
export const servicios: readonly Servicio[] = [
  {
    id: "chef-privado",
    nombre: `${T}.chef-privado.nombre`,
    descripcion: `${T}.chef-privado.descripcion`,
    opciones: [
      {
        id: "paella",
        nombre: `${T}.menus.paella.nombre`,
        precio: { tipo: "porPersona", adulto: eur(55), nino: eur(30), minimoComensales: 10 },
      },
      {
        id: "barbacoa",
        nombre: `${T}.menus.barbacoa.nombre`,
        precio: { tipo: "porPersona", adulto: eur(55), nino: eur(25), minimoComensales: 10 },
      },
    ],
  },
  {
    id: "limpieza-diaria",
    nombre: `${T}.limpieza-diaria.nombre`,
    descripcion: `${T}.limpieza-diaria.descripcion`,
    opciones: [
      { id: "diaria", nombre: `${T}.limpieza-diaria.opciones.diaria`, precio: { tipo: "porDia", importe: eur(125) } },
      { id: "cambio-ropa", nombre: `${T}.limpieza-diaria.opciones.cambio-ropa`, precio: { tipo: "fijo", importe: eur(130) } },
    ],
    provisional: true,
  },
  {
    id: "compra-previa",
    nombre: `${T}.compra-previa.nombre`,
    descripcion: `${T}.compra-previa.descripcion`,
    opciones: [{ id: "gestion", nombre: `${T}.compra-previa.nombre`, precio: compraPrevia }],
  },
  {
    id: "pack-desayuno",
    nombre: `${T}.pack-desayuno.nombre`,
    descripcion: `${T}.pack-desayuno.descripcion`,
    opciones: [{ id: "pack", nombre: `${T}.pack-desayuno.nombre`, precio: { tipo: "fijo", importe: eur(90) } }],
  },
  {
    id: "decoracion-bienvenida",
    nombre: `${T}.decoracion-bienvenida.nombre`,
    descripcion: `${T}.decoracion-bienvenida.descripcion`,
    opciones: [{ id: "decoracion", nombre: `${T}.decoracion-bienvenida.nombre`, precio: { tipo: "fijo", importe: eur(95) } }],
  },
  {
    id: "catamaran",
    nombre: `${T}.catamaran.nombre`,
    descripcion: `${T}.catamaran.descripcion`,
    opciones: [{ id: "4h", nombre: `${T}.catamaran.nombre`, precio: { tipo: "bajoPresupuesto" } }],
  },
  {
    id: "calefaccion-piscina",
    nombre: `${T}.calefaccion-piscina.nombre`,
    descripcion: `${T}.calefaccion-piscina.descripcion`,
    opciones: [{ id: "dia", nombre: `${T}.calefaccion-piscina.nombre`, precio: { tipo: "porDia", importe: eur(90) } }],
  },
];

/** Menú del chef privado; todos los textos son claves de traducción. */
export interface MenuChef {
  id: "paella" | "barbacoa";
  nombre: string;
  entrantes: readonly string[];
  principal: readonly string[];
  postre: readonly string[];
  incluye: readonly string[];
}

const plato = (menu: MenuChef["id"], id: string) => `${T}.menus.${menu}.platos.${id}`;
const incluye = [`${T}.menus.incluye.agua`, `${T}.menus.incluye.pan`, `${T}.menus.incluye.sangria`];

export const menusChef: readonly MenuChef[] = [
  {
    id: "paella",
    nombre: `${T}.menus.paella.nombre`,
    entrantes: ["salmorejo", "tortilla", "queso", "tostas", "aceitunas"].map((p) => plato("paella", p)),
    principal: [plato("paella", "paella")],
    postre: [plato("paella", "crema-catalana")],
    incluye,
  },
  {
    id: "barbacoa",
    nombre: `${T}.menus.barbacoa.nombre`,
    entrantes: ["queso", "salmorejo", "aceitunas"].map((p) => plato("barbacoa", p)),
    principal: ["parrilla", "salsas", "ensalada"].map((p) => plato("barbacoa", p)),
    postre: [plato("barbacoa", "crema-catalana")],
    incluye,
  },
];

/** Lista del pack desayuno de llegada (unas 8 personas). Pendiente de confirmar: no se inventa. */
export const packDesayuno: { pendiente: boolean; articulos: readonly string[] } = {
  pendiente: true,
  articulos: [],
};
