import { notFound } from "next/navigation";
import { isDev } from "@/lib/dev/isDev";

// Todas las páginas /dev/* son herramientas internas: 404 fuera de desarrollo.
export default function DevLayout({ children }: LayoutProps<"/[locale]/dev">) {
  if (!isDev()) {
    notFound();
  }
  return children;
}
