// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import es from "@/messages/es.json";
import EscenasPage from "./page";

vi.mock("next-intl/server", () => ({ getMessages: async () => es }));
vi.mock("lenis/react", () => ({ useLenis: () => undefined }));

afterEach(cleanup);

type Provider = ReactElement<{ messages: Record<string, unknown>; children: ReactElement }>;

describe("página /dev/escenas", () => {
  it("envía al cliente los textos que usa (sin MISSING_MESSAGE) y muestra ambos modos", async () => {
    const pagina = (await EscenasPage()) as Provider;
    const onError = vi.fn();
    render(
      <NextIntlClientProvider locale="es" messages={pagina.props.messages} onError={onError}>
        {pagina.props.children}
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole("heading", { level: 1, name: es.DevEscenas.title })).toBeTruthy();
    expect(screen.getByRole("button", { name: es.DevEscenas.clic.etiqueta })).toBeTruthy();
    expect(onError).not.toHaveBeenCalled();
  });
});
