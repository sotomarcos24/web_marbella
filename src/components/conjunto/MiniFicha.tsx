"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatEuros } from "@/lib/format";
import type { FichaVilla } from "./fichas";

const marca = "ml-1 text-xs italic opacity-70";

// Mini ficha de la parcela activa en el mapa del conjunto (docs/vision.md §2.2).
export function MiniFicha({ ficha }: { ficha: FichaVilla }) {
  const t = useTranslations("Conjunto");
  const locale = useLocale();

  return (
    <div className="w-64 rounded-sm bg-noche/85 p-5 text-cal backdrop-blur-sm">
      <p className="font-display text-2xl">{t("nombre", { numero: ficha.id.replace("villa-", "") })}</p>
      <ul className="mt-3 space-y-1 text-sm">
        <li>{t("plazas", { n: ficha.plazas })}</li>
        <li>
          {t("dormitorios", { n: ficha.dormitorios })}
          {ficha.dormitoriosPendiente && <span className={marca}>{t("pendiente")}</span>}
        </li>
        <li>
          {t("desde", { precio: formatEuros(ficha.precio, locale) })}
          {ficha.precioEstimado && <span className={marca}>{t("estimado")}</span>}
        </li>
      </ul>
    </div>
  );
}
