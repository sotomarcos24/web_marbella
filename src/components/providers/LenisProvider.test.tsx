// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LenisProvider } from "./LenisProvider";

// ReactLenis simulado: crea la instancia al montarse y la destruye al desmontarse.
const lenis = vi.hoisted(() => ({ constructor: vi.fn(), destroy: vi.fn() }));
vi.mock("lenis/react", () => ({
  ReactLenis: ({ root }: { root?: boolean }) => {
    useEffect(() => {
      lenis.constructor({ root });
      return lenis.destroy;
    }, [root]);
    return null;
  },
}));

// matchMedia simulado para '(prefers-reduced-motion: reduce)'.
let reduced = false;
const listeners = new Set<(event: MediaQueryListEvent) => void>();
function setReducedMotion(value: boolean) {
  reduced = value;
  for (const listener of listeners) listener({ matches: value } as MediaQueryListEvent);
}

beforeEach(() => {
  reduced = false;
  listeners.clear();
  vi.clearAllMocks();
  window.matchMedia = vi.fn((query: string) => ({
    get matches() {
      return query === "(prefers-reduced-motion: reduce)" && reduced;
    },
    media: query,
    addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener),
  })) as unknown as typeof window.matchMedia;
});
afterEach(cleanup);

describe("LenisProvider", () => {
  it("activa Lenis y renderiza los hijos", () => {
    render(<LenisProvider><p data-testid="hijo" /></LenisProvider>);
    expect(screen.getByTestId("hijo")).toBeTruthy();
    expect(lenis.constructor).toHaveBeenCalledExactlyOnceWith({ root: true });
  });

  it("no activa Lenis con prefers-reduced-motion", () => {
    reduced = true;
    render(<LenisProvider><p /></LenisProvider>);
    expect(lenis.constructor).not.toHaveBeenCalled();
  });

  it("se desactiva si el usuario activa reduced motion y vuelve si lo quita", () => {
    render(<LenisProvider><p /></LenisProvider>);
    act(() => setReducedMotion(true));
    expect(lenis.destroy).toHaveBeenCalledTimes(1);
    act(() => setReducedMotion(false));
    expect(lenis.constructor).toHaveBeenCalledTimes(2);
  });

  it("destruye Lenis al desmontar", () => {
    const { unmount } = render(<LenisProvider><p /></LenisProvider>);
    unmount();
    expect(lenis.destroy).toHaveBeenCalledTimes(1);
  });
});
