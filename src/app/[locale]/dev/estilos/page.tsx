import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { StyleGuide } from "@/components/dev/StyleGuide";

export default function EstilosPage({ params }: PageProps<"/[locale]/dev/estilos">) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <StyleGuide />;
}
