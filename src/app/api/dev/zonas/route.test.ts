import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { writeContent } from "@/lib/dev/writeContent";
import { POST } from "./route";

vi.mock("@/lib/dev/writeContent", () => ({ writeContent: vi.fn() }));

const ctx = { params: Promise.resolve({}) };
const imagen = "/images/villas/villa-4/villa4_059.webp";
const zona = { id: "jardin", nombre: "zonas.jardin", poligono: [[0, 0], [1, 0], [1, 1]], accion: "planta", destino: "planta-baja" };

const post = (body: unknown) =>
  POST(new Request("http://localhost/api/dev/zonas", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) }), ctx);

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("POST /api/dev/zonas", () => {
  it("salida válida → la guarda en src/content en la ruta derivada de la imagen", async () => {
    const salida = { imagen, zonas: [zona] };
    const res = await post({ clave: imagen, salida });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, archivo: "zonas/villa-4/portada.json" });
    expect(writeContent).toHaveBeenCalledWith("zonas/villa-4/portada.json", salida);
  });

  it("salida que no valida → 422 con los errores y sin escribir", async () => {
    const res = await post({ clave: imagen, salida: { imagen, zonas: [{ ...zona, destino: "sotano" }] } });
    expect(res.status).toBe(422);
    expect((await res.json()).errores.join()).toMatch(/sotano/);
    expect(writeContent).not.toHaveBeenCalled();
  });

  it("salida de otra imagen → 422 sin escribir", async () => {
    const res = await post({ clave: imagen, salida: { imagen: "/otra.webp", zonas: [zona] } });
    expect(res.status).toBe(422);
    expect(writeContent).not.toHaveBeenCalled();
  });

  it.each([
    ["JSON roto", "{ roto"],
    ["clave desconocida", { clave: "/images/villas/villa-4/no-existe.webp", salida: { imagen, zonas: [] } }],
    ["salida mal formada", { clave: imagen, salida: { imagen, zonas: "x" } }],
  ])("%s → 400 sin escribir", async (_, body) => {
    const res = await post(body);
    expect(res.status).toBe(400);
    expect(writeContent).not.toHaveBeenCalled();
  });

  it("fuera de desarrollo → 404", async () => {
    vi.stubEnv("NODE_ENV", "production");
    expect((await post({ clave: imagen, salida: { imagen, zonas: [zona] } })).status).toBe(404);
  });
});
