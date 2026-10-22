import { NextRequest } from "next/server";
import { getRedirectUrl, unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { describe, expect, it } from "vitest";
import { routing } from "@/i18n/routing";
import proxy, { config } from "@/proxy";

const request = (path: string, headers?: Record<string, string>) =>
  new NextRequest(new URL(path, "http://localhost"), { headers });

describe("i18n routing", () => {
  it("ofrece es (por defecto) y en", () => {
    expect(routing.defaultLocale).toBe("es");
    expect([...routing.locales].sort()).toEqual(["en", "es"]);
  });

  it("redirige / al idioma por defecto", async () => {
    const response = await proxy(request("/"));
    expect(getRedirectUrl(response)).toBe("http://localhost/es");
  });

  it("redirige / a /en si el navegador prefiere inglés", async () => {
    const response = await proxy(request("/", { "accept-language": "en-GB,en;q=0.9" }));
    expect(getRedirectUrl(response)).toBe("http://localhost/en");
  });

  it("deja pasar las rutas que ya llevan idioma", async () => {
    const response = await proxy(request("/en/villas"));
    expect(getRedirectUrl(response)).toBeNull();
  });

  it.each(["/", "/es", "/en/villas/villa-1"])("el proxy se aplica a %s", (url) => {
    expect(unstable_doesMiddlewareMatch({ config, url })).toBe(true);
  });

  it.each(["/_next/static/chunk.js", "/images/villas/villa-1/foto.jpg", "/api/dev/x", "/favicon.ico"])(
    "el proxy no se aplica a %s",
    (url) => {
      expect(unstable_doesMiddlewareMatch({ config, url })).toBe(false);
    },
  );
});
