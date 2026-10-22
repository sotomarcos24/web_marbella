// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Card } from "./Card";

afterEach(cleanup);

describe("Card", () => {
  it("renderiza sus hijos y acepta className y atributos", () => {
    render(
      <Card data-testid="card" className="extra">
        <p>Contenido</p>
      </Card>,
    );
    const card = screen.getByTestId("card");
    expect(card.textContent).toBe("Contenido");
    expect(card.className).toContain("extra");
  });

  it("en tono claro va sobre arena/cal con texto tinta; en oscuro, cal sobre noche", () => {
    render(
      <>
        <Card data-testid="light">x</Card>
        <Card data-testid="dark" tone="dark">
          y
        </Card>
      </>,
    );
    const light = screen.getByTestId("light").className.split(/\s+/);
    const dark = screen.getByTestId("dark").className.split(/\s+/);
    expect(light).toContain("text-tinta");
    expect(dark).toContain("bg-noche");
    expect(dark).toContain("text-cal");
  });
});
