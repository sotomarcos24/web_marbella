import { isDev } from "@/lib/dev/isDev";

type RouteHandler<C> = (request: Request, context: C) => Response | Promise<Response>;

/** Envuelve un route handler de /api/dev/*: fuera de desarrollo responde 404 sin ejecutarlo. */
export function devOnly<C>(handler: RouteHandler<C>): RouteHandler<C> {
  return (request, context) => (isDev() ? handler(request, context) : new Response(null, { status: 404 }));
}
