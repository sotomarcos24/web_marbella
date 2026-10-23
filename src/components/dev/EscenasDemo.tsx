"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ScrollSequence } from "@/components/scenes/ScrollSequence";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";

const inicio = "/images/villas/villa-4/villa4_001.webp";
const llegada = "/images/villas/villa-4/villa4_002.webp";

// Página de prueba de ScrollSequence (issue #45): los dos modos con el sustituto sin vídeo.
export function EscenasDemo() {
  const t = useTranslations("DevEscenas");
  const [llegadas, setLlegadas] = useState(0);
  const registrar = () => setLlegadas((n) => n + 1);

  return (
    <main>
      <Container className="flex flex-col gap-4 py-12">
        <Heading level={1}>{t("title")}</Heading>
        <p>{t("intro")}</p>
        <p role="status">{t("llegadas", { count: llegadas })}</p>
        <Heading level={2}>{t("scroll.title")}</Heading>
        <p>{t("scroll.descripcion")}</p>
      </Container>
      <ScrollSequence inicio={inicio} llegada={llegada} alt={t("clic.alt")} etiqueta={t("scroll.etiqueta")} onLlegada={registrar} />
      <Container className="flex flex-col gap-4 py-12">
        <Heading level={2}>{t("clic.title")}</Heading>
        <p>{t("clic.descripcion")}</p>
      </Container>
      <ScrollSequence
        modo="clic"
        inicio={inicio}
        llegada={llegada}
        alt={t("clic.alt")}
        etiqueta={t("clic.etiqueta")}
        onLlegada={registrar}
      />
    </main>
  );
}
