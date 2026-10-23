import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Cabecera } from "@/components/villa/Cabecera";
import { Destacadas } from "@/components/villa/Destacadas";
import { villas } from "@/content/villas";
import { routing } from "@/i18n/routing";

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => villas.map((villa) => ({ locale, id: villa.id })));
}

export default async function VillaPage({ params }: PageProps<"/[locale]/villas/[id]">) {
  const { locale, id } = await params;
  const villa = villas.find((v) => v.id === id);
  if (!hasLocale(routing.locales, locale) || !villa) notFound();
  setRequestLocale(locale);

  const { VillaPage, zonas } = await getMessages();
  const contenidos = [...villa.exteriores, ...villa.plantas.flatMap((planta) => planta.estancias)];
  const fotos = contenidos.map((e) => ({ id: e.id, fotos: e.fotos }));
  // Los exteriores no tienen nombre propio: usan su id (el texto sale de los mensajes).
  const destacadas = (villa.destacadas ?? []).flatMap((id) => {
    const contenido = contenidos.find((e) => e.id === id);
    const foto = contenido?.fotos[0];
    return foto ? [{ id, nombre: "nombre" in contenido ? contenido.nombre : id, foto }] : [];
  });

  return (
    // El layout raíz solo envía al cliente los textos de LocaleSwitcher.
    <NextIntlClientProvider messages={{ VillaPage, zonas }}>
      <main>
        <Cabecera
          id={villa.id}
          imagenDia={villa.hero.imagenDia}
          imagenNoche={villa.hero.imagenNoche}
          zonas={villa.hero.zonas}
          fotos={fotos}
        />
        <Destacadas tarjetas={destacadas} />
      </main>
    </NextIntlClientProvider>
  );
}
