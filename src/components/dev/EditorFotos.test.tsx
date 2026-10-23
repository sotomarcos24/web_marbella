// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Destino, VillaFotos } from "@/lib/dev/fotosAsignacion";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import type { Foto } from "@/types/foto";
import { EditorFotos } from "./EditorFotos";

const foto = (archivo: string, extra: Partial<Foto> = {}): Foto => ({
  villa: "villa-4",
  archivo,
  zona: "interior",
  tipo: "salon",
  confianza: "alta",
  alt: { es: `alt ${archivo}`, en: `alt ${archivo}` },
  ...extra,
});
const destinos: Destino[] = [
  { id: "salon", nombre: "Salón", grupo: "estancia" },
  { id: "jardin", nombre: "Jardín", grupo: "exterior" },
];
const villa4: VillaFotos = {
  villa: "villa-4",
  destinos,
  fotos: [foto("a.webp"), foto("b.webp", { confianza: "baja", estanciaSugerida: "salon" })],
  asignacion: {},
};
const villa1: VillaFotos = { villa: "villa-1", destinos, fotos: [foto("c.webp", { villa: "villa-1" })], asignacion: {} };

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe.each([
  ["es", es],
  ["en", en],
] as const)("EditorFotos (%s)", (locale, messages) => {
  const m = messages.DevFotos;

  beforeEach(() => {
    render(
      <NextIntlClientProvider locale={locale} messages={messages}>
        <EditorFotos villas={[villa4, villa1]} />
      </NextIntlClientProvider>,
    );
  });

  const miniaturas = () => within(screen.getByRole("list", { name: m.miniaturas }));
  const destino = (nombre: string) => within(screen.getByRole("region", { name: nombre }));

  it("muestra título, destinos a la izquierda y miniaturas de la villa elegida", () => {
    expect(screen.getByRole("heading", { level: 1, name: m.title })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Salón" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Jardín" })).toBeTruthy();
    expect(miniaturas().getAllByRole("listitem")).toHaveLength(2);
    fireEvent.change(screen.getByLabelText(m.villa), { target: { value: "villa-1" } });
    expect(miniaturas().getAllByRole("listitem")).toHaveLength(1);
  });

  it("indica la confianza baja y la estancia sugerida", () => {
    const item = miniaturas().getAllByRole("listitem")[1]!;
    expect(within(item).getByText(m.confianzaBaja)).toBeTruthy();
    expect(within(item).getByText(/Salón/, { selector: "span" })).toBeTruthy();
    expect(within(miniaturas().getAllByRole("listitem")[0]!).queryByText(m.confianzaBaja)).toBeNull();
  });

  it("arrastrar una miniatura a un destino la asigna", () => {
    const item = miniaturas().getAllByRole("listitem")[0]!;
    const data: Record<string, string> = {};
    const dataTransfer = { setData: (k: string, v: string) => (data[k] = v), getData: (k: string) => data[k] ?? "", effectAllowed: "" };
    fireEvent.dragStart(item, { dataTransfer });
    const zona = screen.getByRole("region", { name: "Salón" });
    fireEvent.dragOver(zona, { dataTransfer });
    fireEvent.drop(zona, { dataTransfer });
    expect(destino("Salón").getAllByRole("listitem")).toHaveLength(1);
  });

  it("marcar principal pone la foto la primera de su destino", () => {
    const fotosItems = miniaturas().getAllByRole("listitem");
    for (const item of fotosItems) {
      fireEvent.change(within(item).getByLabelText(m.asignarA), { target: { value: "salon" } });
    }
    const filas = () => destino("Salón").getAllByRole("listitem");
    expect(filas()[0]!.textContent).toMatch(/a\.webp/);
    fireEvent.click(within(filas()[1]!).getByRole("button", { name: m.principal }));
    expect(filas()[0]!.textContent).toMatch(/b\.webp/);
  });

  it("guarda con POST /api/dev/fotos y avisa del resultado", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ ok: true, archivo: "fotos/villa-4.json" }));
    fireEvent.change(within(miniaturas().getAllByRole("listitem")[0]!).getByLabelText(m.asignarA), { target: { value: "jardin" } });
    fireEvent.click(screen.getByRole("button", { name: m.guardar }));
    await waitFor(() => expect(screen.getByText(/fotos\/villa-4\.json/)).toBeTruthy());
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/dev/fotos");
    expect(JSON.parse(String(init?.body))).toEqual({ villa: "villa-4", asignacion: { jardin: ["a.webp"] } });
  });
});
