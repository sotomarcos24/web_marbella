// @vitest-environment node
import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { conjunto } from "@/content/conjunto";
import { distribucionCamas } from "@/content/dormitorios";
import { fotos } from "@/content/fotos";
import { villas } from "@/content/villas";
import { validarAsignacion } from "@/lib/dev/fotosAsignacion";
import { validarConjunto, validarVilla } from "@/lib/validation/villa";
import en from "@/messages/en.json";
import es from "@/messages/es.json";

const publico = (ruta: string) => path.join(process.cwd(), "public", ruta);
const villa4 = villas.find((v) => v.id === "villa-4")!;
const estancias = villa4.plantas.flatMap((p) => p.estancias);

describe("villa-4: borrador del agente (#47)", () => {
  it("la portada es villa4_059 con las zonas jardin, planta-baja y planta-alta", () => {
    expect(villa4.hero.imagenDia).toBe("/images/villas/villa-4/villa4_059.webp");
    expect(villa4.hero.zonas.map((z) => [z.id, z.accion, z.destino])).toEqual([
      ["jardin", "galeria", "jardin"],
      ["planta-baja", "planta", "planta-baja"],
      ["planta-alta", "planta", "planta-alta"],
    ]);
  });

  it("los dos planos tienen estancias, con los dormitorios de dormitorios.ts", () => {
    for (const planta of villa4.plantas) expect(planta.estancias.length, planta.id).toBeGreaterThan(0);
    const ids = estancias.map((e) => e.id);
    for (const { id, planta } of distribucionCamas["villa-4"].dormitorios) {
      expect(ids, id).toContain(id);
      const donde = villa4.plantas.find((p) => p.estancias.some((e) => e.id === id));
      expect(donde?.id, id).toBe(`planta-${planta}`);
    }
    expect(estancias.filter((e) => e.tipo === "dormitorio")).toHaveLength(6);
  });

  it("las 4 parcelas están en el conjunto sobre la aérea provisional", () => {
    expect(conjunto?.imagen).toBe("/images/conjunto/aerea-provisional.webp");
    expect(conjunto?.parcelas.map((p) => p.villaId).sort()).toEqual(["villa-1", "villa-3", "villa-4", "villa-5"]);
    expect(validarConjunto(conjunto!, villas.map((v) => v.id))).toEqual([]);
  });

  it("hay fotos propuestas por estancia y exterior, y todas existen en public/", () => {
    const rutas = [...estancias.flatMap((e) => e.fotos), ...villa4.exteriores.flatMap((e) => e.fotos)];
    expect(rutas.length).toBeGreaterThan(20);
    for (const ruta of rutas) expect(existsSync(publico(ruta)), ruta).toBe(true);
    expect(estancias.find((e) => e.id === "salon")?.fotos.length).toBeGreaterThan(0);
    expect(villa4.exteriores.map((e) => e.id)).toEqual(expect.arrayContaining(["porche", "piscina", "jardin"]));
  });

  it("la asignación de fotos no repite ninguna ni usa fotos de otra villa", () => {
    const destinos = [...estancias, ...villa4.exteriores].map((d) => ({ id: d.id, nombre: d.id, grupo: "estancia" as const }));
    const asignacion = Object.fromEntries([...estancias, ...villa4.exteriores].map((d) => [d.id, d.fotos.map((f) => path.basename(f))]));
    expect(validarAsignacion(asignacion, destinos, fotos.filter((f) => f.villa === "villa-4"))).toEqual([]);
  });

  it("5 destacadas: salón, cocina, dormitorio principal, baño y porche/piscina", () => {
    const destacadas = villa4.destacadas ?? [];
    expect(destacadas).toHaveLength(5);
    const tipos = destacadas.map((id) => estancias.find((e) => e.id === id)?.tipo ?? id);
    expect(tipos).toEqual(["salon", "cocina", "dormitorio", "bano", expect.stringMatching(/^(porche|piscina)$/)]);
  });

  it("queda marcada como provisional en pendientes", () => {
    const campos = villa4.pendientes.map((p) => p.campo);
    expect(campos).toEqual(expect.arrayContaining(["hero.zonas-provisionales", "fotos-provisionales"]));
    expect(campos).not.toContain("hero.zonas");
  });

  it("villa-4 y el conjunto pasan validarVilla()", () => {
    expect(validarVilla(villa4, { conjunto: conjunto! })).toEqual([]);
    for (const villa of villas) expect(validarVilla(villa, { conjunto: conjunto! }), villa.id).toEqual([]);
  });
});


describe("villa-4: recorrido T3/T4 (#53)", () => {
  const recorrido = villa4.recorrido ?? [];
  const foto = (n: string) => `/images/villas/villa-4/villa4_${n}.webp`;

  it("T3 puerta (078) → recibidor (044) con «Bienvenido a casa»; T4 recibidor → salón (022)", () => {
    expect(recorrido.map((t) => [t.id, t.transicion, t.inicio, t.imagenFinal])).toEqual([
      ["t3", "villa-4-t3", foto("078"), foto("044")],
      ["t4", "villa-4-t4", foto("044"), foto("022")],
    ]);
    expect(recorrido[0]?.titularKey).toBe("recorrido.bienvenida");
    expect(es.recorrido.bienvenida).toBe("Bienvenido a casa");
    expect(en.recorrido.bienvenida).toBeTruthy();
  });

  it("las imágenes del recorrido existen en public/", () => {
    for (const tramo of recorrido) {
      expect(existsSync(publico(tramo.inicio)), tramo.inicio).toBe(true);
      expect(existsSync(publico(tramo.imagenFinal)), tramo.imagenFinal).toBe(true);
    }
  });

  it("encuadre (object-position) de las fotos verticales, igual en T3 y T4 para que el recibidor no salte", () => {
    for (const tramo of recorrido) expect(tramo.encuadre, tramo.id).toMatch(/^\d{1,3}% \d{1,3}%$/);
    expect(recorrido[0]?.encuadre).toBe(recorrido[1]?.encuadre);
  });
});
