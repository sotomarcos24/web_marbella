import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Cotizador } from "@/components/dev/Cotizador";

export default function CotizadorPage({ params }: PageProps<"/[locale]/dev/cotizador">) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <Cotizador />;
}
