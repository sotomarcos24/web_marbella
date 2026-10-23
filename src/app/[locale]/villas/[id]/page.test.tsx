// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import es from "@/messages/es.json";
import VillaPage, { generateStaticParams } from "./page";

vi.mock("next-intl/server", () => ({
  getMessages: async () => es,
  setRequestLocale: () => {},
}));
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
  usePathname: () => "/es/villas/villa-4",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));
afterEach(cleanup);

type Provider = ReactElement<{ messages: Record<string, unknown>; children: ReactElement }>;
const params = (id: string, locale = "es") =>
  ({ params: Promise.resolve({ locale, id }), searchParams: Promise.resolve({}) }) as PageProps<"/[locale]/villas/[id]">;

describe("página /villas/[id]", () => {
  it("genera la ruta de las 4 villas en cada idioma", () => {
    const ids = generateStaticParams().filter((p) => p.locale === "es").map((p) => p.id);
    expect(ids.sort()).toEqual(["villa-1", "villa-3", "villa-4", "villa-5"]);
  });

  it("villa inexistente → 404", async () => {
    await expect(VillaPage(params("villa-9"))).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it.each(["villa-1", "villa-3", "villa-4", "villa-5"])("%s se renderiza sin textos que falten", async (id) => {
    const pagina = (await VillaPage(params(id))) as Provider;
    const onError = vi.fn();
    render(
      <NextIntlClientProvider locale="es" messages={pagina.props.messages} onError={onError}>
        {pagina.props.children}
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(id.replace("villa-", ""));
    expect(screen.getByRole("button", { name: es.VillaPage.verTodas })).toBeTruthy();
    expect(onError).not.toHaveBeenCalled();
  });

  it("villa-4 no tiene botón día/noche", async () => {
    const pagina = (await VillaPage(params("villa-4"))) as Provider;
    render(
      <NextIntlClientProvider locale="es" messages={pagina.props.messages}>
        {pagina.props.children}
      </NextIntlClientProvider>,
    );
    expect(screen.queryByRole("button", { name: es.VillaPage.noche })).toBeNull();
    expect(screen.getByRole("button", { name: "Jardín" })).toBeTruthy();
  });
});
