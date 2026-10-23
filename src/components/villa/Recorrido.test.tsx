// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ComponentProps } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ScrollSequence } from "@/components/scenes/ScrollSequence";
import es from "@/messages/es.json";
import type { Recorrido as Tramo } from "@/types/villa";
import { Recorrido } from "./Recorrido";

// ScrollSequence ya tiene sus tests: aquí solo importa qué recibe cada tramo.
type Props = ComponentProps<typeof ScrollSequence>;
const escenas = vi.hoisted(() => ({ props: [] as Props[] }));
vi.mock("@/components/scenes/ScrollSequence", () => ({
  ScrollSequence: (props: Props) => {
    escenas.props.push(props);
    return <div data-testid="escena">{props.children}</div>;
  },
}));
beforeEach(() => {
  escenas.props = [];
});
afterEach(cleanup);

const tramos: Tramo[] = [
  { id: "t3", transicion: "villa-4-t3", inicio: "/puerta.webp", imagenFinal: "/recibidor.webp", titularKey: "recorrido.bienvenida", encuadre: "50% 55%" },
  { id: "t4", transicion: "villa-4-t4", inicio: "/recibidor.webp", imagenFinal: "/salon.webp", encuadre: "50% 55%" },
];
const alts = { "/puerta.webp": "Puerta de entrada", "/recibidor.webp": "Recibidor" };

function renderRecorrido(props: Partial<ComponentProps<typeof Recorrido>> = {}) {
  return render(
    <NextIntlClientProvider locale="es" messages={es}>
      <Recorrido tramos={tramos} alts={alts} {...props} />
    </NextIntlClientProvider>,
  );
}

describe("Recorrido", () => {
  it("sin recorrido la sección no se muestra", () => {
    const { container } = renderRecorrido({ tramos: undefined });
    expect(container.innerHTML).toBe("");
  });

  it("con recorrido vacío tampoco se muestra", () => {
    const { container } = renderRecorrido({ tramos: [] });
    expect(container.innerHTML).toBe("");
  });

  it("una ScrollSequence en modo scroll por tramo, de inicio a imagen final, con su encuadre y alt", () => {
    renderRecorrido();
    expect(screen.getByRole("region", { name: es.recorrido.seccion })).toBeTruthy();
    expect(escenas.props.map((p) => [p.modo ?? "scroll", p.inicio, p.llegada, p.encuadre, p.alt])).toEqual([
      ["scroll", "/puerta.webp", "/recibidor.webp", "50% 55%", "Puerta de entrada"],
      ["scroll", "/recibidor.webp", "/salon.webp", "50% 55%", "Recibidor"],
    ]);
  });

  it("titular «Bienvenido a casa» solo en el tramo que lo tiene, visible al llegar a la imagen final", () => {
    renderRecorrido();
    const titular = screen.getByRole("heading", { name: "Bienvenido a casa" });
    expect(screen.getAllByRole("heading")).toHaveLength(1);
    expect(titular.className).toContain("opacity-0");
    act(() => escenas.props[0]!.onLlegada?.());
    expect(titular.className).toContain("opacity-100");
  });
});
