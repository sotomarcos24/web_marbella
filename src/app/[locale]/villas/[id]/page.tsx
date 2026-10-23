import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Cabecera } from "@/components/villa/Cabecera";
import { Plano } from "@/components/villa/Plano";
import { Recorrido } from "@/components/villa/Recorrido";
import { distribucionCamas } from "@/content/dormitorios";
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

  const { VillaPage, zonas, Plano: textosPlano, recorrido } = await getMessages();
  const alts = new Map(catalogo.filter((f) => f.villa === villa.id).map((f) => [f.archivo, f.alt[locale]]));
  const altDe = (src: string) => alts.get(src.split("/").pop() ?? "") ?? "";
  const enGrupo = new Set<string>();
  // Una foto aparece solo en el primer grupo que la usa.
  const fotos = [...villa.exteriores, ...villa.plantas.flatMap((planta) => planta.estancias)].map((e) => ({
    id: e.id,
    nombre: "nombre" in e ? e.nombre : e.id,
    fotos: e.fotos
      .filter((src) => !enGrupo.has(src) && enGrupo.add(src))
      .map((src) => ({ src, alt: altDe(src) })),
  }));
  const altsRecorrido = Object.fromEntries((villa.recorrido ?? []).map((tramo) => [tramo.inicio, altDe(tramo.inicio)]));

  return (
    // El layout raíz solo envía al cliente los textos de LocaleSwitcher.
    <NextIntlClientProvider messages={{ VillaPage, zonas, Plano: textosPlano, recorrido }}>
      <main>
        <Cabecera
          id={villa.id}
          imagenDia={villa.hero.imagenDia}
          imagenNoche={villa.hero.imagenNoche}
          zonas={villa.hero.zonas}
          fotos={fotos}
        />
        <Suspense>
          <Plano
            plantas={villa.plantas}
            dormitorios={distribucionCamas[villa.id].dormitorios}
            estadoCamas={distribucionCamas[villa.id].estado}
          />
        </Suspense>
        <Recorrido tramos={villa.recorrido} alts={altsRecorrido} />
      </main>
    </NextIntlClientProvider>
  );
}
