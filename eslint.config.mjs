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
  {
    // El mock de reservas solo se instancia en el punto de composición (src/lib/booking/index.ts).
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/lib/booking/index.ts", "**/*.test.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [{ group: ["**/booking/mock", "./mock"], message: "Usa bookingProvider de @/lib/booking." }] },
      ],
    },
  },
  globalIgnores(["coverage/**", "imgs/**", "public/**"]),
]);
