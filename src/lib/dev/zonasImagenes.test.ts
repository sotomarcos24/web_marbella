import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { villas } from "@/content/villas";
import { catalogoZonas } from "@/lib/dev/zonasImagenes";
import { aEditables } from "@/lib/dev/zonasSalida";

let raiz: string;
let publicDir: string;
let contentDir: string;

const crear = async (dir: string, rel: string, contenido = "") => {
  const destino = path.join(dir, rel);
  await mkdir(path.dirname(destino), { recursive: true });
  await writeFile(destino, contenido);
};

beforeEach(async () => {
  raiz = await mkdtemp(path.join(tmpdir(), "zonas-"));
  publicDir = path.join(raiz, "public");
  contentDir = path.join(raiz, "content");
  for (const rel of [
    "images/villas/villa-4/villa4_059.webp",
    "images/villas/villa-4/plano-planta-baja.webp",
    "images/conjunto/aerea.webp",
    "images/conjunto/notas.txt",
    "media/transiciones/villa-4/t3/final.webp",
    "media/transiciones/villa-4/t3/fotogramas/0001.webp",
    "media/transiciones/villa-4/t4/0001.webp",
    "media/transiciones/conjunto/t1/final.jpg",
  ]) {
    await crear(publicDir, rel);
  }
  await mkdir(contentDir);
});

afterEach(async () => {
  await rm(raiz, { recursive: true, force: true });
});

const catalogo = () => catalogoZonas({ publicDir, contentDir, villas });

describe("catalogoZonas", () => {
  it("lista portadas y planos existentes, aéreas del conjunto e imágenes finales de transiciones", async () => {
    const entradas = await catalogo();
    expect(entradas.map(({ tipo, imagen, archivo }) => ({ tipo, imagen, archivo }))).toEqual([
      { tipo: "portada", imagen: "/images/villas/villa-4/villa4_059.webp", archivo: "zonas/villa-4/portada.json" },
      { tipo: "plano", imagen: "/images/villas/villa-4/plano-planta-baja.webp", archivo: "zonas/villa-4/planta-baja.json" },
      { tipo: "conjunto", imagen: "/images/conjunto/aerea.webp", archivo: "conjunto.json" },
      { tipo: "conjunto", imagen: "/media/transiciones/conjunto/t1/final.jpg", archivo: "conjunto.json" },
      { tipo: "transicion", imagen: "/media/transiciones/villa-4/t3/final.webp", archivo: "zonas/transiciones/villa-4/t3.json" },
    ]);
  });

  it("la clave es la ruta pública de la imagen y es única", async () => {
    const entradas = await catalogo();
    expect(entradas.map((e) => e.clave)).toEqual(entradas.map((e) => e.imagen));
  });

  it("guarda villa, planta y transición de cada entrada", async () => {
    const [portada, plano, , , transicion] = await catalogo();
    expect(portada).toMatchObject({ villaId: "villa-4" });
    expect(plano).toMatchObject({ villaId: "villa-4", plantaId: "planta-baja" });
    expect(transicion).toMatchObject({ villaId: "villa-4", transicionId: "t3" });
  });

  it("sin JSON guardado, la portada parte de las zonas de villas.ts", async () => {
    const [portada] = await catalogo();
    const villa4 = villas.find((v) => v.id === "villa-4");
    expect(portada?.poligonos).toEqual(aEditables({ imagen: "", zonas: villa4?.hero.zonas ?? [] }));
  });

  it("con JSON guardado, parte de él", async () => {
    const guardado = { imagen: "/images/villas/villa-4/villa4_059.webp", zonas: [{ id: "piscina", nombre: "zonas.piscina", poligono: [[0, 0], [1, 0], [1, 1]], accion: "galeria", destino: "jardin" }] };
    await crear(contentDir, "zonas/villa-4/portada.json", JSON.stringify(guardado));
    const [portada] = await catalogo();
    expect(portada?.poligonos.map((p) => p.id)).toEqual(["piscina"]);
  });

  it("el conjunto solo carga las parcelas guardadas en la imagen a la que pertenecen", async () => {
    await crear(contentDir, "conjunto.json", JSON.stringify({ imagen: "/images/conjunto/aerea.webp", parcelas: [{ villaId: "villa-1", poligono: [[0, 0], [1, 0], [1, 1]] }] }));
    const entradas = await catalogo();
    const [aerea, t1] = entradas.filter((e) => e.tipo === "conjunto");
    expect(aerea?.poligonos.map((p) => p.id)).toEqual(["villa-1"]);
    expect(t1?.poligonos).toEqual([]);
  });

  it("ignora un JSON guardado mal formado", async () => {
    await crear(contentDir, "zonas/villa-4/planta-baja.json", "{ roto");
    const [, plano] = await catalogo();
    expect(plano?.poligonos).toEqual([]);
  });

  it("sin carpetas de conjunto ni transiciones devuelve solo portadas y planos", async () => {
    await rm(path.join(publicDir, "images/conjunto"), { recursive: true });
    await rm(path.join(publicDir, "media"), { recursive: true });
    expect((await catalogo()).map((e) => e.tipo)).toEqual(["portada", "plano"]);
  });
});
