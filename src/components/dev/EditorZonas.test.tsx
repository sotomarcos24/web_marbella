// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ImagenZonas } from "@/lib/dev/zonasSalida";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import { EditorZonas } from "./EditorZonas";

const portada: ImagenZonas = { clave: "/images/villas/villa-4/villa4_059.webp", tipo: "portada", imagen: "/images/villas/villa-4/villa4_059.webp", archivo: "zonas/villa-4/portada.json", villaId: "villa-4", poligonos: [] };
const plano: ImagenZonas = {
  clave: "/images/villas/villa-4/plano-planta-baja.webp",
  tipo: "plano",
  imagen: "/images/villas/villa-4/plano-planta-baja.webp",
  archivo: "zonas/villa-4/planta-baja.json",
  villaId: "villa-4",
  plantaId: "planta-baja",
  poligonos: [{ id: "salon", nombre: "estancias.salon", tipo: "salon", puntos: [[0, 0], [0.5, 0], [0.5, 0.5]], cerrado: true }],
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe.each([
  ["es", es],
  ["en", en],
] as const)("EditorZonas (%s)", (locale, messages) => {
  const m = messages.DevZonas;

  beforeEach(() => {
    render(
      <NextIntlClientProvider locale={locale} messages={messages}>
        <EditorZonas imagenes={[portada, plano]} />
      </NextIntlClientProvider>,
    );
  });

  const lienzo = () => {
    const el = screen.getByLabelText(m.lienzo);
    vi.spyOn(el, "getBoundingClientRect").mockReturnValue({ left: 0, top: 0, width: 200, height: 100, x: 0, y: 0, right: 200, bottom: 100, toJSON: () => ({}) });
    return el;
  };
  const dibujarTriangulo = () => {
    const el = lienzo();
    fireEvent.click(el, { clientX: 20, clientY: 10 });
    fireEvent.click(el, { clientX: 100, clientY: 10 });
    fireEvent.click(el, { clientX: 100, clientY: 50 });
    fireEvent.click(screen.getByRole("button", { name: m.cerrar }));
  };
  const lista = () => within(screen.getByRole("list", { name: m.poligonos }));

  it("tiene título y un selector con todas las imágenes", () => {
    expect(screen.getByRole("heading", { level: 1, name: m.title })).toBeTruthy();
    const selector = screen.getByLabelText(m.imagen);
    expect(within(selector).getAllByRole("option").map((o) => (o as HTMLOptionElement).value)).toEqual([portada.clave, plano.clave]);
  });

  it("clic en la imagen añade vértices normalizados; cerrar crea el polígono", () => {
    dibujarTriangulo();
    expect(lista().getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: /^.+ 3 .+$/ })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: m.exportar }));
    const json = screen.getByLabelText(m.json) as HTMLTextAreaElement;
    expect(JSON.parse(json.value).zonas[0].poligono).toEqual([[0.1, 0.1], [0.5, 0.1], [0.5, 0.5]]);
  });

  it("borrar quita el polígono", () => {
    dibujarTriangulo();
    fireEvent.click(lista().getByRole("button", { name: m.borrar }));
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("muestra los errores de validación y no deja guardar hasta corregirlos", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ ok: true, archivo: portada.archivo }));
    dibujarTriangulo();
    const guardar = screen.getByRole("button", { name: m.guardar }) as HTMLButtonElement;
    expect(within(screen.getByRole("region", { name: m.errores })).getAllByRole("listitem").length).toBeGreaterThan(0);
    expect(guardar.disabled).toBe(true);

    fireEvent.change(screen.getByLabelText(m.campos.id), { target: { value: "jardin" } });
    fireEvent.change(screen.getByLabelText(m.campos.nombre), { target: { value: "zonas.jardin" } });
    fireEvent.change(screen.getByLabelText(m.campos.destino), { target: { value: "jardin" } });
    expect(guardar.disabled).toBe(false);

    fireEvent.click(guardar);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe("/api/dev/zonas");
    expect(JSON.parse(String(init?.body))).toMatchObject({ clave: portada.clave, salida: { zonas: [{ id: "jardin", destino: "jardin" }] } });
    expect((await screen.findByRole("status")).textContent).toContain(portada.archivo);
  });

  it("al cambiar de imagen carga sus polígonos y campos (tipo de estancia en planos)", () => {
    fireEvent.change(screen.getByLabelText(m.imagen), { target: { value: plano.clave } });
    expect(lista().getAllByRole("listitem")).toHaveLength(1);
    fireEvent.click(lista().getByRole("button", { name: "salon" }));
    expect((screen.getByLabelText(m.campos.tipo) as HTMLSelectElement).value).toBe("salon");
  });

  it("arrastrar un vértice lo mueve", () => {
    dibujarTriangulo();
    const el = lienzo();
    const [vertice] = screen.getAllByRole("button", { name: /^.+ 1 .+$/ });
    fireEvent.pointerDown(vertice!, { pointerId: 1 });
    fireEvent.pointerMove(el, { clientX: 200, clientY: 100, pointerId: 1 });
    fireEvent.pointerUp(el, { pointerId: 1 });
    fireEvent.click(screen.getByRole("button", { name: m.exportar }));
    expect(JSON.parse((screen.getByLabelText(m.json) as HTMLTextAreaElement).value).zonas[0].poligono[0]).toEqual([1, 1]);
  });
});
