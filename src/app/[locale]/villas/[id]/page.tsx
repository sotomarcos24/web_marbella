import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Cabecera } from "@/components/villa/Cabecera";
import { fotos as catalogo } from "@/content/fotos";
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
  const alts = new Map(catalogo.filter((f) => f.villa === villa.id).map((f) => [f.archivo, f.alt[locale]]));
  const enGrupo = new Set<string>();
  // Una foto aparece solo en el primer grupo que la usa.
  const fotos = [...villa.exteriores, ...villa.plantas.flatMap((planta) => planta.estancias)].map((e) => ({
    id: e.id,
    nombre: "nombre" in e ? e.nombre : e.id,
    fotos: e.fotos
      .filter((src) => !enGrupo.has(src) && enGrupo.add(src))
      .map((src) => ({ src, alt: alts.get(src.split("/").pop() ?? "") ?? "" })),
  }));

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
      </main>
    </NextIntlClientProvider>
  );
}
