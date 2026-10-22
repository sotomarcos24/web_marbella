// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Heading } from "./Heading";

afterEach(cleanup);

describe("Heading", () => {
  it("usa la etiqueta del nivel indicado", () => {
    render(<Heading level={3}>Título</Heading>);
    expect(screen.getByRole("heading", { level: 3, name: "Título" }).tagName).toBe("H3");
  });

  it("el tamaño es independiente del nivel", () => {
    render(
      <>
        <Heading level={2} size="display">
          Grande
        </Heading>
        <Heading level={2} size="md">
          Pequeño
        </Heading>
      </>,
    );
    const big = screen.getByRole("heading", { name: "Grande" });
    const small = screen.getByRole("heading", { name: "Pequeño" });
    expect(big.tagName).toBe(small.tagName);
    expect(big.className).not.toBe(small.className);
  });

  it("usa la fuente display y pone en cursiva los <em>", () => {
    render(
      <Heading level={1}>
        Bienvenido <em>a casa</em>
      </Heading>,
    );
    const classes = screen.getByRole("heading").className.split(/\s+/);
    expect(classes).toContain("font-display");
    expect(classes).toContain("[&_em]:italic");
  });
});
