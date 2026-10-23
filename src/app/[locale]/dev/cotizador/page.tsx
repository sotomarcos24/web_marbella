import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Cotizador } from "@/components/dev/Cotizador";

export default async function CotizadorPage() {
  const { DevCotizador, pricing, servicios } = await getMessages();
  return (
    // El layout raíz solo envía al cliente los textos de LocaleSwitcher.
    <NextIntlClientProvider messages={{ DevCotizador, pricing, servicios }}>
      <Cotizador />
    </NextIntlClientProvider>
  );
}
