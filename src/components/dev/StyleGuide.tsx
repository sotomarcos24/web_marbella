import { useTranslations } from "next-intl";
import { type ReactNode, useId } from "react";
import { MotionDemo } from "@/components/dev/MotionDemo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Input } from "@/components/ui/Input";
import { type ColorToken, palette } from "@/config/theme";
import { cn } from "@/lib/cn";
import { contrastRatio } from "@/lib/contrast";

function Section({ title, className, children }: { title: string; className?: string; children: ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className={cn("py-16", className)}>
      <Container>
        <Heading id={id} level={2} size="md" className="mb-8">
          {title}
        </Heading>
        {children}
      </Container>
    </section>
  );
}

// Contenido de /dev/estilos: todo el sistema de diseño en una página.
export function StyleGuide() {
  const t = useTranslations("DevEstilos");
  const colors = Object.entries(palette) as [ColorToken, string][];

  return (
    <main>
      <Container className="pt-20 pb-4">
        <Heading level={1} size="xl">
          {t("title")}
        </Heading>
        <p className="mt-4 max-w-2xl">{t("intro")}</p>
      </Container>

      <Section title={t("sections.palette")}>
        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-7">
          {colors.map(([token, hex]) => (
            <li key={token} className="flex flex-col gap-2 text-sm">
              <div
                className="aspect-square rounded-sm border border-tinta/10"
                style={{ backgroundColor: hex }}
              />
              <span className="font-medium">{t(`colors.${token}`)}</span>
              <code>{hex}</code>
              <span className="text-tinta/80">
                {t("contrast", { ratio: contrastRatio(hex, palette.cal).toFixed(2) })}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-2xl text-sm">{t("contrastNote")}</p>
      </Section>

      <Section title={t("sections.typography")}>
        <div className="grid gap-12 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium">{t("fonts.display")}</span>
            <p className="font-display text-heading-lg font-light">{t("fonts.sample")}</p>
            <p className="font-display text-heading-lg font-light italic">{t("fonts.sampleItalic")}</p>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium">{t("fonts.sans")}</span>
            <p className="text-lg">{t("fonts.body")}</p>
          </div>
        </div>
      </Section>

      <Section title={t("sections.scale")}>
        <div className="flex flex-col gap-6">
          <Heading level={3} size="display">
            {t("scale.display")}
          </Heading>
          <Heading level={3} size="xl">
            {t("scale.xl")}
          </Heading>
          <Heading level={3} size="lg">
            {t("scale.lg")}
          </Heading>
          <Heading level={3} size="md">
            {t("scale.md")}
          </Heading>
          <p className="text-base">{t("scale.body")}</p>
          <p className="text-sm">{t("scale.small")}</p>
        </div>
      </Section>

      <Section title={t("sections.buttons")}>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="lg">{t("buttons.primary")}</Button>
          <Button variant="secondary">{t("buttons.secondary")}</Button>
          <Button variant="ghost">{t("buttons.ghost")}</Button>
          <Button disabled>{t("buttons.disabled")}</Button>
        </div>
      </Section>

      <Section title={t("sections.cards")}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <Heading level={3} size="md">
              {t("cards.title")}
            </Heading>
            <p className="mt-3">{t("cards.body")}</p>
          </Card>
          <Card tone="dark">
            <Heading level={3} size="md">
              {t("cards.darkTitle")}
            </Heading>
            <p className="mt-3 text-arena">{t("cards.darkBody")}</p>
          </Card>
        </div>
      </Section>

      <Section title={t("sections.inputs")}>
        <form className="grid max-w-xl gap-6">
          <Input label={t("inputs.name.label")} placeholder={t("inputs.name.placeholder")} />
          <Input type="email" label={t("inputs.email.label")} hint={t("inputs.email.hint")} />
          <Input
            type="number"
            defaultValue={16}
            label={t("inputs.guests.label")}
            hint={t("inputs.guests.hint")}
            error={t("inputs.guests.error")}
          />
        </form>
      </Section>

      <Section title={t("sections.motion")}>
        <p className="mb-8 font-display text-heading-lg font-light">{t("motion.title")}</p>
        <MotionDemo
          rooms={[t("motion.rooms.salon"), t("motion.rooms.cocina"), t("motion.rooms.dormitorio")]}
          replayLabel={t("motion.replay")}
        />
      </Section>

      <Section title={t("sections.dark")} className="bg-noche text-cal">
        <div className="flex min-h-[60vh] flex-col items-start justify-center gap-6">
          <span className="text-sm tracking-[0.3em] text-arena uppercase">{t("dark.eyebrow")}</span>
          <Heading level={3} size="display">
            {t.rich("dark.title", { em: (chunks) => <em>{chunks}</em> })}
          </Heading>
          <p className="max-w-xl text-arena">{t("dark.body")}</p>
          <Button tone="dark" size="lg">
            {t("dark.cta")}
          </Button>
        </div>
      </Section>
    </main>
  );
}
