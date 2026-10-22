import { describe, expect, it } from "vitest";
import en from "@/messages/en.json";
import es from "@/messages/es.json";

type Messages = { [key: string]: string | Messages };

// Rutas de todas las hojas: { a: { b: "x" } } → ["a.b"].
function leaves(messages: Messages, prefix = ""): [string, string][] {
  return Object.entries(messages).flatMap(([key, value]) =>
    typeof value === "string" ? [[prefix + key, value]] : leaves(value, `${prefix}${key}.`),
  );
}

describe("mensajes", () => {
  it("es.json y en.json tienen exactamente las mismas claves", () => {
    const keys = (messages: Messages) => leaves(messages).map(([key]) => key).sort();
    expect(keys(es)).not.toHaveLength(0);
    expect(keys(en)).toEqual(keys(es));
  });

  it.each([
    ["es", es],
    ["en", en],
  ])("%s.json no tiene textos vacíos", (_, messages) => {
    for (const [key, value] of leaves(messages)) {
      expect(value.trim(), key).not.toBe("");
    }
  });
});
