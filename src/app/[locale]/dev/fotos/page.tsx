import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { EditorFotos } from "@/components/dev/EditorFotos";
import { villas } from "@/content/villas";
import { catalogoFotos } from "@/lib/dev/fotosVilla";

// Lee del disco en cada petición: refleja zonas y asignaciones nuevas sin reiniciar.
export const dynamic = "force-dynamic";

export default async function FotosPage() {
  const { DevFotos } = await getMessages();
  return (
    // El layout raíz solo envía al cliente los textos de LocaleSwitcher.
    <NextIntlClientProvider messages={{ DevFotos }}>
      <EditorFotos villas={await catalogoFotos(villas.map((v) => v.id))} />
    </NextIntlClientProvider>
  );
}
