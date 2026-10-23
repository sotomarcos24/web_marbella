import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { EditorZonas } from "@/components/dev/EditorZonas";
import { catalogoZonas } from "@/lib/dev/zonasImagenes";

// Lee del disco en cada petición: refleja imágenes y JSON nuevos sin reiniciar.
export const dynamic = "force-dynamic";

export default async function ZonasPage({ params }: PageProps<"/[locale]/dev/zonas">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { DevZonas } = await getMessages();
  return (
    // El layout raíz solo envía al cliente los textos de LocaleSwitcher.
    <NextIntlClientProvider messages={{ DevZonas }}>
      <EditorZonas imagenes={await catalogoZonas()} />
    </NextIntlClientProvider>
  );
}
