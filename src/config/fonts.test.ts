import { describe, expect, it, vi } from "vitest";

const google = vi.hoisted(() => ({
  Cormorant_Garamond: vi.fn(({ variable }: { variable: string }) => ({ className: "c", variable: `v${variable}` })),
  DM_Sans: vi.fn(({ variable }: { variable: string }) => ({ className: "d", variable: `v${variable}` })),
}));
vi.mock("next/font/google", () => google);

const { fontVariables } = await import("./fonts");
// Las fuentes se cargan al importar el módulo; se guardan las llamadas antes de que Vitest limpie los mocks.
const calls = { display: [...google.Cormorant_Garamond.mock.calls], sans: [...google.DM_Sans.mock.calls] };

describe("fuentes", () => {
  it("carga Cormorant Garamond con cursiva en --font-cormorant", () => {
    expect(calls.display).toEqual([
      [
        expect.objectContaining({
          subsets: expect.arrayContaining(["latin"]),
          style: expect.arrayContaining(["normal", "italic"]),
          variable: "--font-cormorant",
          display: "swap",
        }),
      ],
    ]);
  });

  it("carga DM Sans en --font-dm-sans", () => {
    expect(calls.sans).toEqual([
      [
        expect.objectContaining({
          subsets: expect.arrayContaining(["latin"]),
          variable: "--font-dm-sans",
          display: "swap",
        }),
      ],
    ]);
  });

  it("expone las clases de ambas variables para el <html>", () => {
    expect(fontVariables.split(" ").sort()).toEqual(["v--font-cormorant", "v--font-dm-sans"]);
  });
});
