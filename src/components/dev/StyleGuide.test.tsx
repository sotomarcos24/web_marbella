// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { palette } from "@/config/theme";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import { StyleGuide } from "./StyleGuide";

afterEach(cleanup);

const locales = [
  ["es", es],
  ["en", en],
] as const;

describe.each(locales)("StyleGuide (%s)", (locale, messages) => {
  const m = messages.DevEstilos;
  const section = (name: string) => screen.getByRole("region", { name });

  beforeEach(() => {
    render(
      <NextIntlClientProvider locale={locale} messages={messages}>
        <StyleGuide />
      </NextIntlClientProvider>,
    );
  });

  it("tiene título y todas las secciones", () => {
    expect(screen.getByRole("heading", { level: 1, name: m.title })).toBeTruthy();
    for (const name of Object.values(m.sections)) expect(section(name)).toBeTruthy();
  });

  it("la paleta muestra los 7 colores con su nombre y su hex", () => {
    const region = within(section(m.sections.palette));
    for (const [token, hex] of Object.entries(palette)) {
      expect(region.getByText(m.colors[token as keyof typeof palette])).toBeTruthy();
      expect(region.getByText(hex)).toBeTruthy();
    }
  });

  it("muestra las dos tipografías, en redonda y cursiva", () => {
    const region = within(section(m.sections.typography));
    expect(region.getByText(m.fonts.display)).toBeTruthy();
    expect(region.getByText(m.fonts.sans)).toBeTruthy();
    expect(region.getByText(m.fonts.sampleItalic).closest(".italic")).toBeTruthy();
  });

  it("muestra la escala de texto", () => {
    const region = within(section(m.sections.scale));
    for (const sample of Object.values(m.scale)) expect(region.getByText(sample)).toBeTruthy();
  });

  it("muestra los botones y las tarjetas", () => {
    const buttons = within(section(m.sections.buttons));
    for (const label of Object.values(m.buttons)) expect(buttons.getAllByRole("button", { name: label }).length).toBeGreaterThan(0);
    const cards = within(section(m.sections.cards));
    expect(cards.getByText(m.cards.title)).toBeTruthy();
    expect(cards.getByText(m.cards.darkTitle)).toBeTruthy();
  });

  it("muestra los campos, uno con error", () => {
    const region = within(section(m.sections.inputs));
    expect(region.getByLabelText(m.inputs.name.label)).toBeTruthy();
    expect(region.getByLabelText(m.inputs.email.label)).toBeTruthy();
    expect(region.getByLabelText(m.inputs.guests.label).getAttribute("aria-invalid")).toBe("true");
  });

  it("incluye la demo de Motion con sus estancias y un botón para repetir", () => {
    const region = within(section(m.sections.motion));
    for (const room of Object.values(m.motion.rooms)) expect(region.getByText(room)).toBeTruthy();
    expect(region.getByRole("button", { name: m.motion.replay })).toBeTruthy();
  });

  it("incluye una escena oscura sobre noche con titular en cursiva", () => {
    const dark = section(m.sections.dark);
    expect(dark.className.split(/\s+/)).toContain("bg-noche");
    expect(dark.className.split(/\s+/)).toContain("text-cal");
    expect(within(dark).getAllByRole("heading").some((heading) => heading.querySelector("em"))).toBe(true);
  });
});
