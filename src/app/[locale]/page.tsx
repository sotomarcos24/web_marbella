import { NextIntlClientProvider, useMessages, useTranslations } from "next-intl";
import { fichasConjunto } from "@/components/conjunto/fichas";
import { MapaConjunto } from "@/components/conjunto/MapaConjunto";
import { Intro } from "@/components/intro/Intro";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { conjunto } from "@/content/conjunto";
import { villas } from "@/content/villas";

export default function Home() {
  const t = useTranslations("Intro");
  const { Conjunto } = useMessages();

  return (
    <main>
      <div className="fixed top-4 right-4 z-10 text-cal mix-blend-difference">
        <LocaleSwitcher />
      </div>
      <Intro textos={{ entrar: t("entrar"), aerea: t("aerea"), pista: t("pista"), lema: t("lema") }}>
        {conjunto && (
          <NextIntlClientProvider messages={{ Conjunto }}>
            <MapaConjunto imagen={conjunto.imagen} villas={fichasConjunto(conjunto, villas)} />
          </NextIntlClientProvider>
        )}
      </Intro>
    </main>
  );
}
