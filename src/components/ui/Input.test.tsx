// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Input } from "./Input";

afterEach(cleanup);

describe("Input", () => {
  it("la etiqueta está asociada al campo", () => {
    render(<Input label="Nombre" placeholder="Tu nombre" />);
    const input = screen.getByLabelText("Nombre");
    expect(input.tagName).toBe("INPUT");
    expect(input.getAttribute("placeholder")).toBe("Tu nombre");
  });

  it("dos campos tienen ids distintos", () => {
    render(
      <>
        <Input label="Uno" />
        <Input label="Dos" />
      </>,
    );
    expect(screen.getByLabelText("Uno").id).not.toBe(screen.getByLabelText("Dos").id);
  });

  it("la ayuda describe el campo", () => {
    render(<Input label="Email" hint="Te escribiremos aquí" />);
    const input = screen.getByLabelText("Email");
    expect(input.getAttribute("aria-invalid")).toBeNull();
    const describedBy = input.getAttribute("aria-describedby") ?? "";
    expect(document.getElementById(describedBy)?.textContent).toBe("Te escribiremos aquí");
  });

  it("el error marca el campo inválido y lo describe junto a la ayuda", () => {
    render(<Input label="Huéspedes" hint="Máximo 15" error="Demasiados huéspedes" />);
    const input = screen.getByLabelText("Huéspedes");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    const texts = (input.getAttribute("aria-describedby") ?? "")
      .split(" ")
      .map((id) => document.getElementById(id)?.textContent);
    expect(texts).toEqual(["Máximo 15", "Demasiados huéspedes"]);
  });

  it("reenvía props nativas", () => {
    render(<Input label="Fecha" type="date" name="entrada" required />);
    const input = screen.getByLabelText("Fecha") as HTMLInputElement;
    expect(input.type).toBe("date");
    expect(input.name).toBe("entrada");
    expect(input.required).toBe(true);
  });
});
