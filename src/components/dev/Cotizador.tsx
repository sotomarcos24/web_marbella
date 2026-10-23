"use client";

import { useLocale, useTranslations } from "next-intl";
import { type ReactNode, type SubmitEvent, useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { servicios } from "@/content/servicios";
import { eur as aCentimos } from "@/lib/dinero";
import { bookingProvider, type Disponibilidad } from "@/lib/booking";
import { formatEuros, formatFecha } from "@/lib/format";
import { valoresMensajes } from "@/lib/pricing";
import type {
  ExtraSolicitado,
  FechaISO,
  ResultadoPrecio,
} from "@/types/precio";
import type { PrecioServicio } from "@/types/servicio";
import type { VillaId } from "@/types/villa";

const VILLAS: readonly VillaId[] = ["villa-1", "villa-3", "villa-4", "villa-5"];

interface ExtraForm {
  cantidad: string;
  adultos: string;
  ninos: string;
  /** Importe de la compra en euros. */
  compra: string;
}

const claveExtra = (servicio: string, opcion: string) =>
  `${servicio}:${opcion}`;
const nombreOpcion = new Map(
  servicios.flatMap((s) =>
    s.opciones.map((o) => [claveExtra(s.id, o.id), o.nombre] as const),
  ),
);
const extraVacio: ExtraForm = {
  cantidad: "",
  adultos: "",
  ninos: "",
  compra: "",
};
const hoyUtc = (): FechaISO => new Date().toISOString().slice(0, 10);
const num = (v: string): number | undefined =>
  v === "" ? undefined : Number(v);

function Fila({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-6 py-1">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Campo({
  label,
  children,
}: {
  label: string;
  children: (id: string) => ReactNode;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id}>{label}</label>
      {children(id)}
    </div>
  );
}

const inputClass = "border border-current/30 bg-transparent px-3 py-2";

function Desglose({ d }: { d: Extract<ResultadoPrecio, { tipo: "precio" }> }) {
  const t = useTranslations("DevCotizador");
  const tt = useTranslations();
  const locale = useLocale();
  const eur = (c: number) => formatEuros(c, locale);
  return (
    <div className="mt-4">
      <h3>{t("result.noches")}</h3>
      <ul>
        {d.noches.map((n) => (
          <li key={n.fecha}>
            {`${formatFecha(n.fecha, locale)}: `}
            <span>{eur(n.precio)}</span>
            {n.estimado ? ` (${t("result.estimado")})` : null}
          </li>
        ))}
      </ul>
      <dl className="mt-4">
        <Fila label={t("result.alojamiento")}>{eur(d.alojamiento)}</Fila>
        <Fila label={t("result.limpiezaFinal")}>{eur(d.limpiezaFinal)}</Fila>
        <Fila label={t("result.suplemento")}>
          {eur(d.suplemento.total)}
          {d.suplemento.estimado ? ` (${t("result.estimado")})` : null}
        </Fila>
        <Fila label={t("result.mascotas")}>{eur(d.mascotas)}</Fila>
        {d.extras.map((x) => (
          <Fila
            key={`${x.servicio}:${x.opcion}`}
            label={tt(
              nombreOpcion.get(claveExtra(x.servicio, x.opcion)) ?? x.servicio,
            )}
          >
            {x.importe === null ? t("result.aConsultar") : eur(x.importe)}
          </Fila>
        ))}
        <Fila label={t("result.total")}>{eur(d.total)}</Fila>
        <Fila label={t("result.fianza")}>{eur(d.fianza)}</Fila>
        <Fila label={t("result.cancelacion")}>
          {formatFecha(d.cancelacionGratuitaHasta, locale)}
        </Fila>
      </dl>
      <h3 className="mt-4">{t("result.pagos")}</h3>
      <ul>
        {d.pagos.map((p) => (
          <li key={p.fecha}>
            {`${p.porcentaje} % · `}
            <span>{eur(p.importe)}</span>
            {" · "}
            <span>{formatFecha(p.fecha, locale)}</span>
          </li>
        ))}
      </ul>
      {d.avisos.length > 0 ? (
        <>
          <h3 className="mt-4">{t("result.avisos")}</h3>
          <ul>
            {d.avisos.map((c) => (
              <li key={c}>{tt(`pricing.avisos.${c}`, valoresMensajes)}</li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

// Contenido de /dev/cotizador: prueba la calculadora a través de BookingProvider.
export function Cotizador() {
  const t = useTranslations("DevCotizador");
  const tt = useTranslations();
  const locale = useLocale();

  const [hoy, setHoy] = useState(hoyUtc);
  const [villa, setVilla] = useState<VillaId>("villa-1");
  const [entrada, setEntrada] = useState("");
  const [salida, setSalida] = useState("");
  const [huespedes, setHuespedes] = useState("2");
  const [mascotas, setMascotas] = useState("0");
  const [extras, setExtras] = useState<Record<string, ExtraForm>>({});
  const [salidaCalculo, setSalidaCalculo] = useState<{
    precio: ResultadoPrecio;
    disp: Disponibilidad;
  } | null>(null);

  const cambiarExtra = (clave: string, campo: keyof ExtraForm, valor: string) =>
    setExtras((prev) => ({
      ...prev,
      [clave]: { ...(prev[clave] ?? extraVacio), [campo]: valor },
    }));
  const alternarExtra = (clave: string, activo: boolean) =>
    setExtras((prev) => {
      const resto = Object.fromEntries(
        Object.entries(prev).filter(([k]) => k !== clave),
      );
      return activo ? { ...resto, [clave]: extraVacio } : resto;
    });

  const camposExtra = (clave: string, precio: PrecioServicio) => {
    const valor = extras[clave] ?? extraVacio;
    const numerico = (campo: keyof ExtraForm, etiqueta: string) => (
      <Campo key={campo} label={etiqueta}>
        {(id) => (
          <input
            id={id}
            type="number"
            min={0}
            className={inputClass}
            value={valor[campo]}
            onChange={(e) => cambiarExtra(clave, campo, e.target.value)}
          />
        )}
      </Campo>
    );
    if (precio.tipo === "fijo" || precio.tipo === "porDia")
      return numerico("cantidad", t("form.cantidad"));
    if (precio.tipo === "porPersona")
      return [
        numerico("adultos", t("form.adultos")),
        numerico("ninos", t("form.ninos")),
      ];
    if (precio.tipo === "escalonado")
      return numerico("compra", t("form.compra"));
    return null;
  };

  async function calcular(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const extrasSolicitados: ExtraSolicitado[] = servicios.flatMap((s) =>
      s.opciones.flatMap((o) => {
        const f = extras[claveExtra(s.id, o.id)];
        if (!f) return [];
        const compra = num(f.compra);
        return [
          {
            servicio: s.id,
            opcion: o.id,
            cantidad: num(f.cantidad),
            adultos: num(f.adultos),
            ninos: num(f.ninos),
            compra: compra === undefined ? undefined : aCentimos(compra),
          },
        ];
      }),
    );
    const solicitud = {
      villa,
      entrada,
      salida,
      huespedes: Number(huespedes),
      mascotas: Number(mascotas),
      extras: extrasSolicitados,
      hoy,
    };
    const [precio, disp] = await Promise.all([
      bookingProvider.cotizar(solicitud),
      bookingProvider.disponibilidad(villa, { entrada, salida }),
    ]);
    setSalidaCalculo({ precio, disp });
  }

  return (
    <main>
      <Container className="py-16">
        <Heading level={1} size="xl">
          {t("title")}
        </Heading>
        <p className="mt-4 max-w-2xl">{t("intro")}</p>

        <form
          onSubmit={calcular}
          className="mt-10 grid max-w-2xl gap-4"
          aria-label={t("form.title")}
        >
          <Campo label={t("form.hoy")}>
            {(id) => (
              <input
                id={id}
                type="date"
                className={inputClass}
                value={hoy}
                onChange={(e) => setHoy(e.target.value)}
              />
            )}
          </Campo>
          <Campo label={t("form.villa")}>
            {(id) => (
              <select
                id={id}
                className={inputClass}
                value={villa}
                onChange={(e) => setVilla(e.target.value as VillaId)}
              >
                {VILLAS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            )}
          </Campo>
          <Campo label={t("form.entrada")}>
            {(id) => (
              <input
                id={id}
                type="date"
                className={inputClass}
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
              />
            )}
          </Campo>
          <Campo label={t("form.salida")}>
            {(id) => (
              <input
                id={id}
                type="date"
                className={inputClass}
                value={salida}
                onChange={(e) => setSalida(e.target.value)}
              />
            )}
          </Campo>
          <Campo label={t("form.huespedes")}>
            {(id) => (
              <input
                id={id}
                type="number"
                min={1}
                className={inputClass}
                value={huespedes}
                onChange={(e) => setHuespedes(e.target.value)}
              />
            )}
          </Campo>
          <Campo label={t("form.mascotas")}>
            {(id) => (
              <input
                id={id}
                type="number"
                min={0}
                className={inputClass}
                value={mascotas}
                onChange={(e) => setMascotas(e.target.value)}
              />
            )}
          </Campo>

          <fieldset className="grid gap-3">
            <legend>{t("form.extras")}</legend>
            {servicios.flatMap((s) =>
              s.opciones.map((o) => {
                const clave = claveExtra(s.id, o.id);
                const id = `extra-${clave}`;
                return (
                  <div key={clave} className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        id={id}
                        type="checkbox"
                        checked={clave in extras}
                        onChange={(e) => alternarExtra(clave, e.target.checked)}
                      />
                      <label htmlFor={id}>{tt(o.nombre)}</label>
                    </div>
                    {clave in extras ? camposExtra(clave, o.precio) : null}
                  </div>
                );
              }),
            )}
          </fieldset>

          <Button
            type="submit"
            variant="secondary"
            className="justify-self-start"
          >
            {t("form.calcular")}
          </Button>
        </form>

        {salidaCalculo ? (
          <>
            <section aria-label={t("result.title")} className="mt-12 max-w-2xl">
              <Heading level={2} size="md">
                {t("result.title")}
              </Heading>
              {salidaCalculo.precio.tipo === "error" ? (
                <div className="mt-4">
                  <h3>{t("result.errores")}</h3>
                  <ul>
                    {salidaCalculo.precio.errores.map((c) => (
                      <li key={c}>
                        {tt(`pricing.errores.${c}`, valoresMensajes)}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {salidaCalculo.precio.tipo === "oferta-invierno" ? (
                <div className="mt-4">
                  <p>{t("result.oferta")}</p>
                  <dl>
                    <Fila label={t("result.noches")}>{salidaCalculo.precio.noches}</Fila>
                  </dl>
                  <ul>
                    {salidaCalculo.precio.avisos.map((c) => (
                      <li key={c}>
                        {tt(`pricing.avisos.${c}`, valoresMensajes)}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {salidaCalculo.precio.tipo === "precio" ? (
                <Desglose d={salidaCalculo.precio} />
              ) : null}
            </section>

            <section
              aria-label={t("disponibilidad.title")}
              className="mt-12 max-w-2xl"
            >
              <Heading level={2} size="md">
                {t("disponibilidad.title")}
              </Heading>
              <p className="mt-2">
                {salidaCalculo.disp.libre
                  ? t("disponibilidad.libre")
                  : t("disponibilidad.ocupada")}
              </p>
              {salidaCalculo.disp.ocupados.length > 0 ? (
                <div className="mt-2">
                  <h3>{t("disponibilidad.ocupados")}</h3>
                  <ul>
                    {salidaCalculo.disp.ocupados.map((r) => (
                      <li key={r.entrada}>
                        {`${formatFecha(r.entrada, locale)} → ${formatFecha(r.salida, locale)}`}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          </>
        ) : null}
      </Container>
    </main>
  );
}
