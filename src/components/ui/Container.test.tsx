// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Container } from "./Container";

afterEach(cleanup);

describe("Container", () => {
  it("es un div centrado con ancho máximo por defecto", () => {
    render(<Container data-testid="c">x</Container>);
    const container = screen.getByTestId("c");
    expect(container.tagName).toBe("DIV");
    expect(container.className).toMatch(/max-w-/);
    expect(container.className.split(/\s+/)).toContain("mx-auto");
  });

  it("admite otra etiqueta con as y combina className", () => {
    render(
      <Container as="section" aria-label="Zona" className="extra">
        x
      </Container>,
    );
    const section = screen.getByRole("region", { name: "Zona" });
    expect(section.tagName).toBe("SECTION");
    expect(section.className).toContain("extra");
  });
});
