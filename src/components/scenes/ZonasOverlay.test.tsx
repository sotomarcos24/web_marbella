// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ZonasOverlay } from "./ZonasOverlay";

afterEach(cleanup);

const zonas = [
  { id: "piscina", nombre: "Piscina", poligono: [[0.1, 0.5], [0.4, 0.5], [0.4, 0.9]] as const },
  { id: "salon", nombre: "Salón", poligono: [[0.5, 0.1], [0.9, 0.1], [0.9, 0.4], [0.5, 0.4]] as const },
];
const base = { zonas, visible: true, onSeleccion: () => {}, etiquetaLista: "Zonas de la villa" };

const svg = (c: HTMLElement) => c.querySelector("svg")!;
const poligonos = (c: HTMLElement) => Array.from(c.querySelectorAll("polygon")) as SVGPolygonElement[];

describe("ZonasOverlay", () => {
  it("dibuja un svg 0–1 con slice y un polígono por zona", () => {
    const { container } = render(<ZonasOverlay {...base} />);
    expect(svg(container).getAttribute("viewBox")).toBe("0 0 1 1");
    expect(svg(container).getAttribute("preserveAspectRatio")).toBe("xMidYMid slice");
    expect(poligonos(container)).toHaveLength(2);
    expect(poligonos(container)[0]!.getAttribute("points")).toBe("0.1,0.5 0.4,0.5 0.4,0.9");
  });

  it("sin visible está oculto, sin zonas accesibles ni clicables", () => {
    const { container } = render(<ZonasOverlay {...base} visible={false} />);
    expect(svg(container).getAttribute("class")).toContain("opacity-0");
    expect(svg(container).getAttribute("class")).toContain("pointer-events-none");
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("con visible aparece con fundido", () => {
    const { container } = render(<ZonasOverlay {...base} />);
    expect(svg(container).getAttribute("class")).toContain("opacity-100");
    expect(svg(container).getAttribute("class")).toContain("transition-opacity");
  });

  it("cada zona es un botón con aria-label", () => {
    render(<ZonasOverlay {...base} />);
    expect(screen.getByRole("button", { name: "Piscina" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Salón" })).toBeTruthy();
  });

  it("hay una lista alternativa etiquetada con una entrada por zona", () => {
    render(<ZonasOverlay {...base} />);
    const lista = screen.getByRole("list", { name: "Zonas de la villa" });
    expect(lista.querySelectorAll("li")).toHaveLength(2);
  });

  it("Enter y Espacio sobre el botón llaman a onSeleccion con el id", () => {
    const onSeleccion = vi.fn();
    render(<ZonasOverlay {...base} onSeleccion={onSeleccion} />);
    const boton = screen.getByRole("button", { name: "Salón" });
    // El navegador convierte Enter/Espacio en click (detail 0) sobre un <button>.
    fireEvent.click(boton, { detail: 0 });
    expect(onSeleccion).toHaveBeenCalledWith("salon");
  });

  it("el clic de ratón sobre el polígono selecciona", () => {
    const onSeleccion = vi.fn();
    const { container } = render(<ZonasOverlay {...base} onSeleccion={onSeleccion} />);
    fireEvent.pointerDown(poligonos(container)[0]!, { pointerType: "mouse" });
    fireEvent.click(poligonos(container)[0]!);
    expect(onSeleccion).toHaveBeenCalledWith("piscina");
  });

  it("al pasar el ratón se oscurece la zona y aparece su nombre", () => {
    const { container } = render(<ZonasOverlay {...base} />);
    expect(container.querySelector("text")).toBeNull();
    fireEvent.pointerEnter(poligonos(container)[0]!, { pointerType: "mouse" });
    expect(container.querySelector("text")?.textContent).toBe("Piscina");
    expect(poligonos(container)[0]!.getAttribute("data-activa")).toBe("true");
    fireEvent.pointerLeave(poligonos(container)[0]!, { pointerType: "mouse" });
    expect(container.querySelector("text")).toBeNull();
  });

  it("al enfocar con teclado se oscurece la zona y aparece su nombre", () => {
    const { container } = render(<ZonasOverlay {...base} />);
    fireEvent.focus(screen.getByRole("button", { name: "Salón" }));
    expect(container.querySelector("text")?.textContent).toBe("Salón");
    expect(poligonos(container)[1]!.getAttribute("data-activa")).toBe("true");
    fireEvent.blur(screen.getByRole("button", { name: "Salón" }));
    expect(container.querySelector("text")).toBeNull();
  });

  it("táctil: el primer toque muestra la ficha y el segundo activa", () => {
    const onSeleccion = vi.fn();
    const { container } = render(<ZonasOverlay {...base} onSeleccion={onSeleccion} />);
    const zona = () => poligonos(container)[0]!;
    fireEvent.pointerDown(zona(), { pointerType: "touch" });
    fireEvent.click(zona());
    expect(onSeleccion).not.toHaveBeenCalled();
    expect(container.querySelector("text")?.textContent).toBe("Piscina");
    fireEvent.pointerDown(zona(), { pointerType: "touch" });
    fireEvent.click(zona());
    expect(onSeleccion).toHaveBeenCalledExactlyOnceWith("piscina");
  });

  it("táctil: tocar otra zona solo cambia la ficha", () => {
    const onSeleccion = vi.fn();
    const { container } = render(<ZonasOverlay {...base} onSeleccion={onSeleccion} />);
    fireEvent.pointerDown(poligonos(container)[0]!, { pointerType: "touch" });
    fireEvent.click(poligonos(container)[0]!);
    fireEvent.pointerDown(poligonos(container)[1]!, { pointerType: "touch" });
    fireEvent.click(poligonos(container)[1]!);
    expect(onSeleccion).not.toHaveBeenCalled();
    expect(container.querySelector("text")?.textContent).toBe("Salón");
  });

  it("al ocultarse se limpia la ficha", () => {
    const { container, rerender } = render(<ZonasOverlay {...base} />);
    fireEvent.pointerEnter(poligonos(container)[0]!, { pointerType: "mouse" });
    rerender(<ZonasOverlay {...base} visible={false} />);
    rerender(<ZonasOverlay {...base} />);
    expect(container.querySelector("text")).toBeNull();
  });
});
