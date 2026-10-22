import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Ningún texto visible escrito en componentes: todo sale de src/messages.
    files: ["src/app/**/*.tsx", "src/components/**/*.tsx"],
    ignores: ["**/*.test.tsx"],
    rules: { "react/jsx-no-literals": "error" },
  },
  globalIgnores(["coverage/**", "imgs/**", "public/**"]),
]);
