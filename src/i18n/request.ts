import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import * as rootParams from "next/root-params";
import { routing } from "./routing";

// Locale explícito (p. ej. getTranslations({ locale })) o, si no, el segmento raíz [locale].
export default getRequestConfig(async ({ locale: explicito }) => {
  const requested = explicito ?? (await rootParams.locale());
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
