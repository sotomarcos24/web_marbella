import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Todo salvo /api, /_next, /_vercel y archivos con extensión (imágenes, favicon…).
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
