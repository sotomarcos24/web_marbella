"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { type DragEvent, useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import { type Asignacion, asignar, type Destino, destinoDe, marcarPrincipal, quitar, sugerencia, validarAsignacion, type VillaFotos } from "@/lib/dev/fotosAsignacion";
import type { Foto } from "@/types/foto";
import type { VillaId } from "@/types/villa";

type Guardado = { tipo: "ok"; archivo: string } | { tipo: "error"; errores: readonly string[] } | null;

const selectClass = cn("rounded-sm border border-tinta/60 bg-cal px-2 py-1 text-sm text-tinta", focusRing);
const srcFoto = (villa: VillaId, archivo: string) => `/images/villas/${villa}/${archivo}`;

function Miniatura({ villa, foto, destinos, actual, onAsignar }: { villa: VillaId; foto: Foto; destinos: readonly Destino[]; actual: string | undefined; onAsignar: (destinoId: string) => void }) {
  const t = useTranslations("DevFotos");
  const id = useId();
  const { destinoId, baja } = sugerencia(foto, destinos);
  const nombreSugerido = destinos.find((d) => d.id === destinoId)?.nombre;
  const alt = foto.alt.es;

  return (
    <li
      draggable
      onDragStart={(e: DragEvent) => {
        e.dataTransfer.setData("text/plain", foto.archivo);
        e.dataTransfer.effectAllowed = "move";
      }}
      className="flex cursor-grab flex-col gap-1.5 rounded-sm border border-tinta/30 p-2"
    >
      <Image src={srcFoto(villa, foto.archivo)} alt={alt} width={240} height={160} sizes="240px" className="h-28 w-full object-cover" draggable={false} />
      <p className="truncate text-xs">{foto.archivo}</p>
      {baja && <span className="text-xs font-medium text-terracota">{t("confianzaBaja")}</span>}
      {nombreSugerido && <span className="text-xs">{t("sugerida", { destino: nombreSugerido })}</span>}
      <label htmlFor={id} className="sr-only">
        {t("asignarA")}
      </label>
      <select id={id} className={selectClass} value={actual ?? ""} onChange={(e) => onAsignar(e.target.value)}>
        <option value="">{t("sinAsignar")}</option>
        {destinos.map((d) => (
          <option key={d.id} value={d.id}>
            {d.nombre}
          </option>
        ))}
      </select>
    </li>
  );
}

function ZonaDestino({ destino, archivos, onDrop, onPrincipal, onQuitar }: { destino: Destino; archivos: readonly string[]; onDrop: (archivo: string) => void; onPrincipal: (archivo: string) => void; onQuitar: (archivo: string) => void }) {
  const t = useTranslations("DevFotos");
  return (
    <section
      aria-label={destino.nombre}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const archivo = e.dataTransfer.getData("text/plain");
        if (archivo) onDrop(archivo);
      }}
      className="rounded-sm border border-dashed border-tinta/50 p-3"
    >
      <h3 className="text-sm font-medium">{destino.nombre}</h3>
      {archivos.length === 0 ? (
        <p className="text-xs text-tinta/60">{t("vacio")}</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-1">
          {archivos.map((archivo, i) => (
            <li key={archivo} className="flex items-center justify-between gap-2 text-xs">
              <span className="truncate">{archivo}</span>
              <span className="flex gap-1">
                <Button type="button" variant="secondary" disabled={i === 0} onClick={() => onPrincipal(archivo)}>
                  {t("principal")}
                </Button>
                <Button type="button" variant="secondary" onClick={() => onQuitar(archivo)}>
                  {t("quitar")}
                </Button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function EditorFotos({ villas }: { villas: readonly VillaFotos[] }) {
  const t = useTranslations("DevFotos");
  const selectorId = useId();
  const [villaId, setVillaId] = useState<VillaId | undefined>(villas[0]?.villa);
  const [asignaciones, setAsignaciones] = useState<Partial<Record<VillaId, Asignacion>>>(() => Object.fromEntries(villas.map((v) => [v.villa, v.asignacion])));
  const [guardado, setGuardado] = useState<Guardado>(null);

  const datos = villas.find((v) => v.villa === villaId);
  if (!datos) return null;
  const asignacion = asignaciones[datos.villa] ?? {};
  const actualizar = (siguiente: Asignacion) => {
    setAsignaciones((previo) => ({ ...previo, [datos.villa]: siguiente }));
    setGuardado(null);
  };
  const errores = validarAsignacion(asignacion, datos.destinos, datos.fotos);

  const guardar = async () => {
    try {
      const res = await fetch("/api/dev/fotos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ villa: datos.villa, asignacion }) });
      const cuerpo = (await res.json()) as { ok: boolean; archivo?: string; errores?: string[] };
      setGuardado(res.ok && cuerpo.archivo ? { tipo: "ok", archivo: cuerpo.archivo } : { tipo: "error", errores: cuerpo.errores ?? [t("errorGuardar")] });
    } catch {
      setGuardado({ tipo: "error", errores: [t("errorGuardar")] });
    }
  };

  const grupo = (g: Destino["grupo"], titulo: string) => (
    <div className="flex flex-col gap-3">
      <h3 className="font-medium">{titulo}</h3>
      {datos.destinos
        .filter((d) => d.grupo === g)
        .map((d) => (
          <ZonaDestino
            key={d.id}
            destino={d}
            archivos={asignacion[d.id] ?? []}
            onDrop={(archivo) => actualizar(asignar(asignacion, d.id, archivo))}
            onPrincipal={(archivo) => actualizar(marcarPrincipal(asignacion, d.id, archivo))}
            onQuitar={(archivo) => actualizar(quitar(asignacion, archivo))}
          />
        ))}
    </div>
  );

  return (
    <Container className="flex flex-col gap-6 py-10">
      <Heading level={1}>{t("title")}</Heading>
      <p className="max-w-3xl">{t("intro")}</p>
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={selectorId} className="text-sm font-medium">
            {t("villa")}
          </label>
          <select id={selectorId} className={selectClass} value={datos.villa} onChange={(e) => {
              setVillaId(e.target.value as VillaId);
              setGuardado(null);
            }}>
            {villas.map((v) => (
              <option key={v.villa} value={v.villa}>
                {v.villa}
              </option>
            ))}
          </select>
        </div>
        <Button type="button" onClick={guardar} disabled={errores.length > 0}>
          {t("guardar")}
        </Button>
        {guardado?.tipo === "ok" && <p role="status">{t("guardado", { archivo: guardado.archivo })}</p>}
      </div>
      {(errores.length > 0 || guardado?.tipo === "error") && (
        <div role="alert">
          <p className="font-medium">{t("errores")}</p>
          <ul>
            {[...errores, ...(guardado?.tipo === "error" ? guardado.errores : [])].map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="flex flex-col gap-6">
          <h2 className="text-lg font-medium">{t("destinos")}</h2>
          {datos.destinos.some((d) => d.grupo === "estancia") ? grupo("estancia", t("estancias")) : <p className="text-sm">{t("sinEstancias")}</p>}
          {grupo("exterior", t("exteriores"))}
        </div>
        <div>
          <h2 className="mb-3 text-lg font-medium">{t("miniaturas")}</h2>
          <ul aria-label={t("miniaturas")} className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {datos.fotos.map((f) => (
              <Miniatura key={f.archivo} villa={datos.villa} foto={f} destinos={datos.destinos} actual={destinoDe(asignacion, f.archivo)} onAsignar={(id) => actualizar(id ? asignar(asignacion, id, f.archivo) : quitar(asignacion, f.archivo))} />
            ))}
          </ul>
        </div>
      </div>
    </Container>
  );
}
