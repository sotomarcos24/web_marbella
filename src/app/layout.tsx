import type { ReactNode } from "react";
import "./globals.css";

// El idioma y los metadatos llegan con next-intl y src/config/site.ts (issue #2).
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
