// @vitest-environment node
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { aWebp, carpetaPublica, photosConfig } from "../../scripts/photos.config";
import { distribucionCamas } from "@/content/dormitorios";
import { fotos } from "@/content/fotos";
import { villas } from "@/content/villas";
import type { TipoFoto } from "@/types/foto";
import type { VillaId } from "@/types/villa";

const PUBLIC = path.join(process.cwd(), "public");
const RAIZ = path.join(PUBLIC, "images/villas");
const enPublic = (url: string) => existsSync(path.join(PUBLIC, url));

const VILLAS = villas.map((v) => v.id);
const TIPOS: readonly TipoFoto[] = [
  "salon", "cocina", "comedor", "dormitorio", "bano", "piscina", "jardin",
  "porche", "barbacoa", "terraza", "fachada", "vistas", "detalle",
];
const PORTADAS = {
  "villa-1": "villa1_012.webp",
  "villa-3": "villa3_019.webp",
  "villa-4": "villa4_059.webp",
  "villa-5": "villa5_002.webp",
} satisfies Record<VillaId, string>;

describe("fotos.ts (SPEC §12)", () => {
  it("cada archivo existe en public/images/villas/<villa>/", () => {
    const faltan = fotos.filter((f) => !existsSync(path.join(RAIZ, f.villa, f.archivo)));
    expect(faltan.map((f) => `${f.villa}/${f.archivo}`)).toEqual([]);
  });

  it("villa, zona, tipo y confianza válidos", () => {
    for (const f of fotos) {
      expect(VILLAS, f.archivo).toContain(f.villa);
      expect(["interior", "exterior"], f.archivo).toContain(f.zona);
      expect(TIPOS, f.archivo).toContain(f.tipo);
      expect(["alta", "baja"], f.archivo).toContain(f.confianza);
    }
  });

  it("sin archivos duplicados y cada archivo pertenece a su villa", () => {
    const claves = fotos.map((f) => `${f.villa}/${f.archivo}`);
    expect(new Set(claves).size).toBe(claves.length);
    for (const f of fotos) {
      const origen = photosConfig.villas.find((c) => carpetaPublica(c) === f.villa);
      expect(f.archivo, f.archivo).toMatch(new RegExp(`^${origen}_\\d+(_\\d+)?\\.webp$`));
    }
  });

  it("alt ES y EN no vacíos y distintos", () => {
    for (const f of fotos) {
      expect(f.alt.es.trim(), f.archivo).not.toBe("");
      expect(f.alt.en.trim(), f.archivo).not.toBe("");
      expect(f.alt.es, f.archivo).not.toBe(f.alt.en);
    }
  });

  it("estanciaSugerida de un dormitorio es un id de la distribución de camas", () => {
    for (const f of fotos.filter((f) => f.tipo === "dormitorio" && f.estanciaSugerida)) {
      const ids = distribucionCamas[f.villa].dormitorios.map((d) => d.id);
      expect(ids, f.archivo).toContain(f.estanciaSugerida);
    }
  });

  it("no incluye exclusiones, planos ni el mapa pendiente de edición", () => {
    const prohibidos = new Set([
      ...photosConfig.exclusiones.map((e) => aWebp(e.archivo)),
      ...photosConfig.pendientesEdicion.map(aWebp),
      ...Object.values(photosConfig.planos).map((p) => aWebp(p.archivo)),
    ]);
    expect(fotos.filter((f) => prohibidos.has(f.archivo)).map((f) => f.archivo)).toEqual([]);
  });

  it("toda foto publicada (salvo planos) está catalogada", () => {
    for (const villa of VILLAS) {
      const publicadas = readdirSync(path.join(RAIZ, villa)).filter((a) => !a.startsWith("plano-")).sort();
      const catalogadas = fotos.filter((f) => f.villa === villa).map((f) => f.archivo).sort();
      expect(catalogadas, villa).toEqual(publicadas);
    }
  });
});

describe("villas.ts apunta a imágenes que existen en public/", () => {
  it("imagenDia, imagenNoche e imagenPlano", () => {
    for (const villa of villas) {
      expect(villa.hero.imagenDia).toBe(`/images/villas/${villa.id}/${PORTADAS[villa.id]}`);
      const urls = [villa.hero.imagenDia, villa.hero.imagenNoche, ...villa.plantas.map((p) => p.imagenPlano)];
      for (const url of urls.filter((u) => u !== undefined)) expect(enPublic(url), url).toBe(true);
    }
  });
});
