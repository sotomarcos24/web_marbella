// Único punto de composición: el resto de la app importa de aquí, nunca de `./mock`.
// Para pasar a Hostaway + Stripe basta con cambiar esta línea.
import { MockBookingProvider } from "./mock";
import type { BookingProvider } from "./types";

export const bookingProvider: BookingProvider = new MockBookingProvider();

export * from "./types";
