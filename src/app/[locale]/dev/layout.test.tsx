import { afterEach, describe, expect, it, vi } from "vitest";
import DevLayout from "./layout";

const NOT_FOUND = "NEXT_HTTP_ERROR_FALLBACK;404";
const params = Promise.resolve({ locale: "es" });

describe("layout de /dev", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each(["production", "test"])("con NODE_ENV=%s responde notFound()", (env) => {
    vi.stubEnv("NODE_ENV", env);
    expect(() => DevLayout({ children: null, params })).toThrow(expect.objectContaining({ digest: NOT_FOUND }));
  });

  it("en desarrollo devuelve los hijos", () => {
    vi.stubEnv("NODE_ENV", "development");
    const hijos = <p>hijos</p>;
    expect(DevLayout({ children: hijos, params })).toBe(hijos);
  });
});
