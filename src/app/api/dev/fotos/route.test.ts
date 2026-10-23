import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fotos } from "@/content/fotos";
import { writeContent } from "@/lib/dev/writeContent";
import { POST } from "./route";

vi.mock("@/lib/dev/writeContent", () => ({ writeContent: vi.fn() }));

const ctx = { params: Promise.resolve({}) };
const archivo = fotos.find((f) => f.villa === "villa-4")!.archivo;

const post = (body: unknown) =>
  POST(new Request("http://localhost/api/dev/fotos", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) }), ctx);

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("POST /api/dev/fotos", () => {
  it("asignación válida → la guarda en fotos/<villa>.json", async () => {
    const asignacion = { jardin: [archivo] };
    const res = await post({ villa: "villa-4", asignacion });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, archivo: "fotos/villa-4.json" });
    expect(writeContent).toHaveBeenCalledWith("fotos/villa-4.json", asignacion);
  });

  it("destino o foto desconocidos → 422 con errores y sin escribir", async () => {
    const res = await post({ villa: "villa-4", asignacion: { sotano: ["nope.webp"] } });
    expect(res.status).toBe(422);
    expect((await res.json()).errores.join()).toMatch(/sotano/);
    expect(writeContent).not.toHaveBeenCalled();
  });

  it("villa desconocida, JSON roto o asignación mal formada → 400 sin escribir", async () => {
    for (const body of [{ villa: "villa-9", asignacion: {} }, "{no", { villa: "villa-4", asignacion: { jardin: "x" } }]) {
      expect((await post(body)).status).toBe(400);
    }
    expect(writeContent).not.toHaveBeenCalled();
  });

  it("fuera de desarrollo → 404", async () => {
    vi.stubEnv("NODE_ENV", "production");
    expect((await post({ villa: "villa-4", asignacion: {} })).status).toBe(404);
    expect(writeContent).not.toHaveBeenCalled();
  });
});
