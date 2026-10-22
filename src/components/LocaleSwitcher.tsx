"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const current = useLocale();
  const pathname = usePathname();

  return (
    <nav aria-label={t("label")}>
      <ul className="flex gap-3">
        {routing.locales.map((locale) => (
          <li key={locale}>
            <Link
              href={pathname}
              locale={locale}
              hrefLang={locale}
              aria-current={locale === current ? "true" : undefined}
              className={locale === current ? "font-semibold" : "opacity-70 hover:opacity-100"}
            >
              {t(`locales.${locale}`)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
