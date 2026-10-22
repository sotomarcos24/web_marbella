// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

afterEach(cleanup);

describe("Button", () => {
  it("es un botón de tipo button por defecto", () => {
    render(<Button>Reservar</Button>);
    expect(screen.getByRole("button", { name: "Reservar" }).getAttribute("type")).toBe("button");
  });

  it("respeta type, disabled, onClick y className", () => {
    const onClick = vi.fn();
    render(
      <>
        <Button type="submit" className="extra" onClick={onClick}>
          Enviar
        </Button>
        <Button disabled onClick={onClick}>
          Bloqueado
        </Button>
      </>,
    );
    const submit = screen.getByRole("button", { name: "Enviar" });
    expect(submit.getAttribute("type")).toBe("submit");
    expect(submit.className).toContain("extra");
    fireEvent.click(submit);
    fireEvent.click(screen.getByRole("button", { name: "Bloqueado" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("el primario usa texto cal sobre mar (contraste AA), no sobre terracota", () => {
    render(<Button>Primario</Button>);
    const classes = screen.getByRole("button").className.split(/\s+/);
    expect(classes).toContain("bg-mar");
    expect(classes).toContain("text-cal");
    expect(classes).not.toContain("bg-terracota");
  });

  it("en tono oscuro el primario invierte a cal sobre noche", () => {
    render(<Button tone="dark">Oscuro</Button>);
    const classes = screen.getByRole("button").className.split(/\s+/);
    expect(classes).toContain("bg-cal");
    expect(classes).toContain("text-noche");
  });

  it("cada variante tiene estilos distintos y foco visible", () => {
    render(
      <>
        <Button variant="primary">A</Button>
        <Button variant="secondary">B</Button>
        <Button variant="ghost">C</Button>
      </>,
    );
    const classNames = screen.getAllByRole("button").map((button) => button.className);
    expect(new Set(classNames).size).toBe(3);
    for (const className of classNames) expect(className).toMatch(/focus-visible:/);
  });
});
