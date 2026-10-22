import type { Centimos } from "@/types/dinero";

/** Euros a céntimos enteros. */
export const eur = (euros: number): Centimos => Math.round(euros * 100);
