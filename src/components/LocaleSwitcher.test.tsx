// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import { LocaleSwitcher } from "./LocaleSwitcher";

// Solo se simula el router de Next; Link y usePathname son los reales de @/i18n/navigation.
const pathname = vi.hoisted(() => ({ current: "/es/villas/villa-1" }));
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  usePathname: () => pathname.current,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));
afterEach(cleanup);

function renderIn(locale: "es" | "en") {
  pathname.current = `/${locale}/villas/villa-1`;
  render(
    <NextIntlClientProvider locale={locale} messages={locale === "es" ? es : en}>
      <LocaleSwitcher />
    </NextIntlClientProvider>,
  );
}

describe("LocaleSwitcher", () => {
  it("enlaza la página actual en cada idioma", () => {
    renderIn("es");
    const hrefs = screen.getAllByRole("link").map((link) => link.getAttribute("href"));
    expect(hrefs).toEqual(["/es/villas/villa-1", "/en/villas/villa-1"]);
  });

  it("marca el idioma actual", () => {
    renderIn("en");
    const current = screen.getAllByRole("link").filter((link) => link.getAttribute("aria-current"));
    expect(current.map((link) => link.getAttribute("hreflang"))).toEqual(["en"]);
  });

  it("usa las etiquetas de los mensajes", () => {
    renderIn("es");
    expect(screen.getByRole("navigation", { name: es.LocaleSwitcher.label })).toBeTruthy();
    expect(screen.getByRole("link", { name: es.LocaleSwitcher.locales.en })).toBeTruthy();
  });
});
