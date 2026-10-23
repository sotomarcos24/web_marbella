"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode, useId, useMemo, useReducer, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Input } from "@/components/ui/Input";
import { focusRing } from "@/components/ui/styles";
import { villas } from "@/content/villas";
import { cn } from "@/lib/cn";
import { type AccionEditor, editorZonas, estadoInicial, normalizar, type PoligonoEditable } from "@/lib/dev/polygon";
import { construirSalida, type ImagenZonas, validarSalida } from "@/lib/dev/zonasSalida";
import { destinosZona } from "@/lib/validation/villa";
import { ACCIONES_ZONA, type AccionZona, TIPOS_ESTANCIA, type TipoEstancia } from "@/types/villa";

type Guardado = { tipo: "ok"; archivo: string } | { tipo: "error"; errores: readonly string[] } | null;

const selectClass = cn("rounded-sm border border-tinta/60 bg-cal px-4 py-3 text-tinta", focusRing);
const puntosSvg = (p: PoligonoEditable) => p.puntos.map(([x, y]) => `${x},${y}`).join(" ");

function CampoSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (valor: string) => void; children: ReactNode }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <select id={id} className={selectClass} value={value} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
    </div>
  );
}

/** Ids a los que puede llevar una zona según su acción (las reglas de `validarVilla`). */
function destinosPosibles(entrada: ImagenZonas, accion: AccionZona): string[] {
  const villa = villas.find((v) => v.id === entrada.villaId);
  return villa ? [...destinosZona(villa)[accion]] : [];
}

function FormularioPoligono({ entrada, poligono, editar }: { entrada: ImagenZonas; poligono: PoligonoEditable; editar: (campos: Partial<PoligonoEditable>) => void }) {
  const t = useTranslations("DevZonas");

  if (entrada.tipo === "conjunto") {
    return (
      <CampoSelect label={t("campos.villa")} value={poligono.id} onChange={(id) => editar({ id })}>
        {[...new Set([poligono.id, ...villas.map((v) => v.id)])].map((id) => (
          <option key={id} value={id}>
            {id}
          </option>
        ))}
      </CampoSelect>
    );
  }

  const accion = poligono.accion ?? "galeria";
  return (
    <div className="flex flex-col gap-3">
      <Input label={t("campos.id")} value={poligono.id} onChange={(e) => editar({ id: e.target.value })} />
      <Input label={t("campos.nombre")} value={poligono.nombre} onChange={(e) => editar({ nombre: e.target.value })} />
      {entrada.tipo === "plano" ? (
        <CampoSelect label={t("campos.tipo")} value={poligono.tipo ?? "otro"} onChange={(tipo) => editar({ tipo: tipo as TipoEstancia })}>
          {TIPOS_ESTANCIA.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </CampoSelect>
      ) : (
        <>
          <CampoSelect label={t("campos.accion")} value={accion} onChange={(a) => editar({ accion: a as AccionZona })}>
            {ACCIONES_ZONA.map((a) => (
              <option key={a} value={a}>
                {t(`acciones.${a}`)}
              </option>
            ))}
          </CampoSelect>
          <CampoSelect label={t("campos.destino")} value={poligono.destino ?? ""} onChange={(destino) => editar({ destino })}>
            <option value="">{t("sinDestino")}</option>
            {destinosPosibles(entrada, accion).map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </CampoSelect>
        </>
      )}
    </div>
  );
}

export function EditorZonas({ imagenes }: { imagenes: readonly ImagenZonas[] }) {
  const t = useTranslations("DevZonas");
  const [clave, setClave] = useState(imagenes[0]?.clave);
  const entrada = imagenes.find((e) => e.clave === clave);
  const [estado, dispatch] = useReducer(editorZonas, entrada?.poligonos ?? [], estadoInicial);
  // Cambios sin guardar de cada imagen, para no perderlos al cambiar de una a otra.
  const [editados, setEditados] = useState<Record<string, readonly PoligonoEditable[]>>({});
  const [arrastre, setArrastre] = useState<{ poligono: number; vertice: number } | null>(null);
  const [verJson, setVerJson] = useState(false);
  const [guardado, setGuardado] = useState<Guardado>(null);
  const [guardando, setGuardando] = useState(false);
  const lienzo = useRef<HTMLDivElement>(null);
  // Validar en cada render saldría caro al arrastrar vértices: solo cuando cambian los polígonos.
  const salida = useMemo(() => entrada && construirSalida(entrada, estado.poligonos), [entrada, estado.poligonos]);
  const errores = useMemo(() => (entrada && salida ? validarSalida(entrada, salida, villas) : []), [entrada, salida]);

  if (!entrada || !salida) {
    return (
      <Container>
        <Heading level={1}>{t("title")}</Heading>
        <p>{t("sinImagenes")}</p>
      </Container>
    );
  }

  const json = verJson ? JSON.stringify(salida, null, 2) : "";
  const indiceSeleccionado = estado.seleccionado;
  const seleccionado = indiceSeleccionado === null ? undefined : estado.poligonos[indiceSeleccionado];

  const cambiar = (accion: AccionEditor) => {
    dispatch(accion);
    setGuardado(null);
  };
  const punto = (e: { clientX: number; clientY: number }) => normalizar(e.clientX, e.clientY, lienzo.current?.getBoundingClientRect() ?? { left: 0, top: 0, width: 0, height: 0 });

  const elegirImagen = (nueva: string) => {
    setEditados({ ...editados, [entrada.clave]: estado.poligonos });
    setClave(nueva);
    dispatch({ tipo: "cargar", poligonos: editados[nueva] ?? imagenes.find((e) => e.clave === nueva)?.poligonos ?? [] });
    setArrastre(null);
    setGuardado(null);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (arrastre) cambiar({ tipo: "moverVertice", ...arrastre, punto: punto(e) });
  };
  const onTeclaVertice = (e: KeyboardEvent, poligono: number, vertice: number) => {
    if (e.key === "Delete" || e.key === "Backspace") cambiar({ tipo: "borrarVertice", poligono, vertice });
  };
  const detener = (e: MouseEvent) => e.stopPropagation();

  const guardar = async () => {
    setGuardando(true);
    try {
      const res = await fetch("/api/dev/zonas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clave: entrada.clave, salida }) });
      const datos = (await res.json()) as { ok: boolean; archivo?: string; errores?: string[] };
      setGuardado(datos.ok && datos.archivo ? { tipo: "ok", archivo: datos.archivo } : { tipo: "error", errores: datos.errores ?? [] });
    } catch {
      setGuardado({ tipo: "error", errores: [] });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Container>
      <Heading level={1}>{t("title")}</Heading>
      <p className="mt-2 max-w-prose">{t("intro")}</p>

      <div className="mt-6 max-w-xl">
        <CampoSelect label={t("imagen")} value={entrada.clave} onChange={elegirImagen}>
          {imagenes.map((e) => (
            <option key={e.clave} value={e.clave}>
              {`${t(`tipos.${e.tipo}`)} · ${e.imagen}`}
            </option>
          ))}
        </CampoSelect>
        <p className="mt-1 text-sm">{t("archivo", { archivo: entrada.archivo })}</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div
          ref={lienzo}
          aria-label={t("lienzo")}
          className="relative cursor-crosshair touch-none select-none"
          onClick={(e) => cambiar({ tipo: "agregarVertice", punto: punto(e) })}
          onPointerMove={onPointerMove}
          onPointerUp={() => setArrastre(null)}
          onPointerLeave={() => setArrastre(null)}
        >
          <Image src={entrada.imagen} alt="" width={0} height={0} sizes="66vw" unoptimized draggable={false} className="h-auto w-full" />
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true">
            {estado.poligonos.map((p, i) => {
              const props = {
                points: puntosSvg(p),
                vectorEffect: "non-scaling-stroke" as const,
                strokeWidth: i === estado.seleccionado ? 3 : 2,
                className: i === estado.seleccionado ? "stroke-terracota fill-terracota/25" : "stroke-cal fill-cal/20",
              };
              return p.cerrado ? <polygon key={i} {...props} /> : <polyline key={i} {...props} fill="none" />;
            })}
          </svg>
          {estado.poligonos.map((p, i) =>
            p.puntos.map(([x, y], v) => (
              <button
                key={`${i}-${v}`}
                type="button"
                aria-label={t("vertice", { n: v + 1, id: p.id })}
                className="absolute size-3.5 -translate-x-1/2 -translate-y-1/2 cursor-move rounded-full border-2 border-tinta bg-cal"
                style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
                onClick={detener}
                onKeyDown={(e) => onTeclaVertice(e, i, v)}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setArrastre({ poligono: i, vertice: v });
                  dispatch({ tipo: "seleccionar", poligono: i });
                }}
              />
            )),
          )}
        </div>

        <div className="flex flex-col gap-6">
          <Button type="button" onClick={() => cambiar({ tipo: "cerrar" })}>
            {t("cerrar")}
          </Button>

          <ul aria-label={t("poligonos")} className="flex flex-col gap-2">
            {estado.poligonos.map((p, i) => (
              <li key={i} className="flex items-center justify-between gap-3">
                <button type="button" className={i === estado.seleccionado ? "font-semibold underline" : "underline"} onClick={() => dispatch({ tipo: "seleccionar", poligono: i })}>
                  {p.id}
                </button>
                {p.cerrado ? null : <span className="text-sm">{t("abierto")}</span>}
                <Button type="button" variant="secondary" onClick={() => cambiar({ tipo: "borrarPoligono", poligono: i })}>
                  {t("borrar")}
                </Button>
              </li>
            ))}
          </ul>

          {seleccionado && indiceSeleccionado !== null ? (
            <FormularioPoligono entrada={entrada} poligono={seleccionado} editar={(campos) => cambiar({ tipo: "editar", poligono: indiceSeleccionado, campos })} />
          ) : null}

          <section aria-label={t("errores")}>
            <Heading level={2}>{t("errores")}</Heading>
            {errores.length > 0 ? (
              <ul className="mt-2 list-disc pl-5 text-sm">
                {errores.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm">{t("sinErrores")}</p>
            )}
          </section>

          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="secondary" onClick={() => setVerJson(!verJson)}>
              {t("exportar")}
            </Button>
            <Button type="button" disabled={errores.length > 0 || guardando} onClick={guardar}>
              {t("guardar")}
            </Button>
          </div>
          {guardado?.tipo === "ok" ? <p role="status">{t("guardado", { archivo: guardado.archivo })}</p> : null}
          {guardado?.tipo === "error" ? (
            <div role="alert">
              <p>{t("errorGuardar")}</p>
              <ul className="list-disc pl-5 text-sm">
                {guardado.errores.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {verJson ? (
            <div className="flex flex-col gap-2">
              <label htmlFor="zonas-json" className="text-sm font-medium">
                {t("json")}
              </label>
              <textarea id="zonas-json" readOnly rows={12} value={json} className={`${selectClass} font-mono text-xs`} />
              <a className="underline" download={entrada.archivo.split("/").join("_")} href={`data:application/json;charset=utf-8,${encodeURIComponent(json)}`}>
                {t("descargar")}
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </Container>
  );
}
