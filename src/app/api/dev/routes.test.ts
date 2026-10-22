import { afterEach, describe, expect, it, vi } from "vitest";

// Red de seguridad: todo handler de /api/dev/*, presente o futuro, debe ir envuelto en devOnly().
const rutas = import.meta.glob<Record<string, unknown>>("./**/route.ts", { eager: true });
const METODOS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

const handlers = Object.entries(rutas).flatMap(([archivo, mod]) =>
  METODOS.filter((m) => typeof mod[m] === "function").map(
    (m) => [`${m} ${archivo}`, mod[m] as (req: Request, ctx: unknown) => Promise<Response>] as const,
  ),
);

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("todas las rutas de /api/dev", () => {
  it("hay al menos una ruta descubierta", () => {
    expect(handlers.length).toBeGreaterThan(0);
  });

  it.each(handlers)("%s responde 404 en producción", async (_, handler) => {
    vi.stubEnv("NODE_ENV", "production");
    const res = await handler(new Request("http://localhost/api/dev"), { params: Promise.resolve({}) });
    expect(res.status).toBe(404);
  });
});
