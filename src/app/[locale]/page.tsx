import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { siteConfig } from "@/config/site";

export default function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("Home");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-4xl">{siteConfig.name}</h1>
      <p>{t("tagline")}</p>
      <LocaleSwitcher />
    </main>
  );
}
