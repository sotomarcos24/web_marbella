import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  // next-intl importa "next/server" sin extensión: Vite lo resuelve, el ESM de Node no.
  test: { setupFiles: ["tests/setup.ts"], isolate: false, server: { deps: { inline: ["next-intl"] } } },
});
