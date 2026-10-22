import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const req = new Request("http://localhost/api/dev/estado");
const ctx = { params: Promise.resolve({}) };

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("GET /api/dev/estado", () => {
  it.each(["production", "test"])("con NODE_ENV=%s responde 404", async (env) => {
    vi.stubEnv("NODE_ENV", env);
    const res = await GET(req, ctx);
    expect(res.status).toBe(404);
  });

  it("en desarrollo responde 200 { ok: true }", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const res = await GET(req, ctx);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});
