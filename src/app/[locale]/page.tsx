import { useTranslations } from "next-intl";
import { Intro } from "@/components/intro/Intro";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export default function Home() {
  const t = useTranslations("Intro");

  return (
    <main>
      <div className="fixed top-4 right-4 z-10 text-cal mix-blend-difference">
        <LocaleSwitcher />
      </div>
      <Intro textos={{ entrar: t("entrar"), aerea: t("aerea"), pista: t("pista"), lema: t("lema") }} />
    </main>
  );
}
