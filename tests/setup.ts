// jsdom no trae matchMedia y Motion lo consulta (prefers-reduced-motion). Valor por defecto:
// sin preferencias; los tests que necesiten otro lo sustituyen.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

// Tampoco trae IntersectionObserver (whileInView de Motion). El sustituto no avisa nunca:
// los elementos se quedan en su estado inicial, pero siguen en el DOM.
if (typeof window !== "undefined" && !window.IntersectionObserver) {
  window.IntersectionObserver = class {
    readonly root = null;
    readonly rootMargin = "";
    readonly thresholds = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
}
