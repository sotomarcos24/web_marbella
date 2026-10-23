import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { EscenasDemo } from "@/components/dev/EscenasDemo";

export default async function EscenasPage() {
  const { DevEscenas } = await getMessages();
  return (
    // El layout raíz solo envía al cliente los textos de LocaleSwitcher.
    <NextIntlClientProvider messages={{ DevEscenas }}>
      <EscenasDemo />
    </NextIntlClientProvider>
  );
}
