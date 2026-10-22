import { afterEach, describe, expect, it, vi } from "vitest";
import { devOnly } from "@/lib/dev/devOnly";

const req = new Request("http://localhost/api/dev/x");
const ctx = { params: Promise.resolve({}) };

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("devOnly", () => {
  it("no ejecuta el handler fuera de desarrollo", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const handler = vi.fn(() => new Response("secreto"));
    const res = await devOnly(handler)(req, ctx);
    expect(res.status).toBe(404);
    expect(handler).not.toHaveBeenCalled();
  });

  it("pasa la petición y el contexto al handler en desarrollo", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const handler = vi.fn(() => new Response("ok"));
    await devOnly(handler)(req, ctx);
    expect(handler).toHaveBeenCalledWith(req, ctx);
  });
});
