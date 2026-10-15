"use client";

import { useCallback, useState } from "react";
import { FileSpreadsheet, FileText, Table } from "lucide-react";
import Alerta from "@/components/ui/Alerta";
import { useAuth } from "@/features/auth/AuthContext";
import { estiloEstado, etiquetaEstado } from "@/features/citas/constantes";
import { infoTurno } from "@/features/empleados/constantes";
import { formatoFecha, formatoFechaHora } from "@/lib/fechas";
import { useApi } from "@/lib/useApi";
import { useCarga } from "@/lib/useCarga";
import {
  ESTADOS_REPORTE,
  formatoPorcentaje,
  porcentaje,
  rangoAnterior,
  rellenarDias,
  textoVariacion,
} from "./calculos";
import { exportarCsv } from "./exportarCsv";
import { exportarExcel } from "./exportarExcel";
import { exportarPdf } from "./exportarPdf";
import GraficoDiario from "./GraficoDiario";
import { obtenerDetalle, obtenerResumen } from "./service";
import type { DatosReporte, FiltrosReporte } from "./types";

interface Props {
  filtros: FiltrosReporte;
  etiquetaEspecialidad: string;
  etiquetaMedico: string;
}

type Formato = "pdf" | "excel" | "csv";
const FILAS_DETALLE = 50;

export default function ReporteVista({
  filtros,
  etiquetaEspecialidad,
  etiquetaMedico,
}: Props) {
  const api = useApi();
  const { user } = useAuth();
  const [exportando, setExportando] = useState<Formato | null>(null);
  const [errorExportar, setErrorExportar] = useState("");

  const cargar = useCallback(async () => {
    const [resumen, anterior, detalle] = await Promise.all([
      obtenerResumen(api, filtros),
      obtenerResumen(api, {
        ...filtros,
        ...rangoAnterior(filtros.desde, filtros.hasta),
      }),
      obtenerDetalle(api, filtros),
    ]);
    return { resumen, anterior, detalle, generadoEn: new Date() };
  }, [api, filtros]);

  const { datos, error, cargando } = useCarga(cargar);

  async function exportar(formato: Formato) {
    if (!datos || !user) return;
    setExportando(formato);
    setErrorExportar("");
    const completo: DatosReporte = {
      filtros,
      etiquetaEspecialidad,
      etiquetaMedico,
      generadoPor: `${user.nombre} ${user.apellido}`,
      ...datos,
    };
    try {
      if (formato === "pdf") await exportarPdf(completo);
      else if (formato === "excel") await exportarExcel(completo);
      else exportarCsv(completo);
    } catch {
      setErrorExportar("No se pudo generar el archivo. Inténtalo nuevamente.");
    } finally {
      setExportando(null);
    }
  }

  if (error) return <Alerta mensaje={error} />;
  if (cargando || !datos) {
    return (
      <p className="rounded-xl bg-white p-6 text-center text-slate-500">
        Generando reporte...
      </p>
    );
  }

  const { resumen, anterior, detalle } = datos;
  const t = resumen.totales;
  const dias = rellenarDias(resumen.porDia, filtros.desde, filtros.hasta);
  const maxEsp = Math.max(1, ...resumen.porEspecialidad.map((e) => e.total));

  const tarjetas = [
    {
      etiqueta: "Citas registradas",
      valor: String(t.total),
      nota: textoVariacion(t.total, anterior.totales.total),
    },
    {
      etiqueta: "Atendidas",
      valor: String(t.atendidas),
      nota: formatoPorcentaje(porcentaje(t.atendidas, t.total)),
    },
    {
      etiqueta: "Pendientes",
      valor: String(t.pendientes),
      nota: formatoPorcentaje(porcentaje(t.pendientes, t.total)),
    },
    {
      etiqueta: "Canceladas",
      valor: String(t.canceladas),
      nota: formatoPorcentaje(porcentaje(t.canceladas, t.total)),
    },
    {
      etiqueta: "No asistió",
      valor: String(t.noAsistidas),
      nota: formatoPorcentaje(porcentaje(t.noAsistidas, t.total)),
    },
    {
      etiqueta: "Pacientes distintos",
      valor: String(t.pacientesDistintos),
      nota: `${t.medicosConCitas} médicos con citas`,
    },
  ];

  const botones: {
    formato: Formato;
    etiqueta: string;
    icono: typeof FileText;
  }[] = [
    { formato: "pdf", etiqueta: "PDF", icono: FileText },
    { formato: "excel", etiqueta: "Excel", icono: FileSpreadsheet },
    { formato: "csv", etiqueta: "CSV", icono: Table },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Período: <strong>{formatoFecha(filtros.desde)}</strong> al{" "}
          <strong>{formatoFecha(filtros.hasta)}</strong> ·{" "}
          {etiquetaEspecialidad} · {etiquetaMedico}
        </p>
        <div className="flex gap-2">
          {botones.map((b) => {
            const Icono = b.icono;
            return (
              <button
                key={b.formato}
                type="button"
                disabled={exportando !== null}
                onClick={() => exportar(b.formato)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <Icono size={16} />
                {exportando === b.formato ? "Generando..." : b.etiqueta}
              </button>
            );
          })}
        </div>
      </div>

      <Alerta mensaje={errorExportar} />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tarjetas.map((c) => (
          <div
            key={c.etiqueta}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <p className="text-sm text-slate-500">{c.etiqueta}</p>
            <p className="text-3xl font-bold">{c.valor}</p>
            <p className="text-xs text-slate-500">{c.nota}</p>
          </div>
        ))}
      </section>

      {t.total === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          No hay citas en el período seleccionado.
        </p>
      ) : (
        <>
          <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold">Estado de las citas</h3>
            <div className="flex h-4 gap-0.5 overflow-hidden rounded">
              {ESTADOS_REPORTE.map((e) =>
                t[e.clave] > 0 ? (
                  <div
                    key={e.clave}
                    style={{
                      width: `${porcentaje(t[e.clave], t.total)}%`,
                      backgroundColor: e.color,
                    }}
                    title={`${e.etiqueta}: ${t[e.clave]}`}
                  />
                ) : null,
              )}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
              {ESTADOS_REPORTE.map((e) => (
                <span
                  key={e.clave}
                  className="inline-flex items-center gap-1.5"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: e.color }}
                  />
                  {e.etiqueta}: {t[e.clave]} (
                  {formatoPorcentaje(porcentaje(t[e.clave], t.total))})
                </span>
              ))}
            </div>
          </section>

          <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold">Evolución diaria de citas</h3>
            <GraficoDiario dias={dias} />
          </section>

          <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold">Citas por especialidad</h3>
            <div className="space-y-2">
              {resumen.porEspecialidad.map((e) => (
                <div
                  key={e.idEspecialidad}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="w-40 shrink-0 text-slate-600">
                    {e.especialidad}
                  </span>
                  <div className="h-3 flex-1 rounded bg-slate-100">
                    <div
                      className="h-3 rounded bg-sky-700"
                      style={{ width: `${(e.total / maxEsp) * 100}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-medium">{e.total}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white">
            <h3 className="px-5 pt-5 font-semibold">
              Productividad por médico
            </h3>
            <div className="overflow-x-auto p-2">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Médico</th>
                    <th className="px-3 py-2">Especialidad</th>
                    <th className="px-3 py-2">Turno</th>
                    <th className="px-3 py-2 text-center">Total</th>
                    <th className="px-3 py-2 text-center">Atend.</th>
                    <th className="px-3 py-2 text-center">Pend.</th>
                    <th className="px-3 py-2 text-center">Canc.</th>
                    <th className="px-3 py-2 text-center">No asist.</th>
                  </tr>
                </thead>
                <tbody>
                  {[...resumen.porMedico]
                    .sort((a, b) => b.total - a.total)
                    .map((m) => (
                      <tr
                        key={m.idMedico}
                        className="border-t border-slate-100"
                      >
                        <td className="px-3 py-2 font-medium">{m.medico}</td>
                        <td className="px-3 py-2 text-slate-600">
                          {m.especialidad}
                        </td>
                        <td className="px-3 py-2 text-slate-600">
                          {infoTurno(m.turno)?.etiqueta ?? "—"}
                        </td>
                        <td className="px-3 py-2 text-center font-semibold">
                          {m.total}
                        </td>
                        <td className="px-3 py-2 text-center">{m.atendidas}</td>
                        <td className="px-3 py-2 text-center">
                          {m.pendientes}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {m.canceladas}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {m.noAsistidas}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white">
            <h3 className="px-5 pt-5 font-semibold">
              Citas registradas por usuario de ventanilla
            </h3>
            <div className="p-2">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Usuario</th>
                    <th className="px-3 py-2 text-center">Citas registradas</th>
                  </tr>
                </thead>
                <tbody>
                  {resumen.porUsuario.map((u) => (
                    <tr key={u.idUsuario} className="border-t border-slate-100">
                      <td className="px-3 py-2 font-medium">{u.nombre}</td>
                      <td className="px-3 py-2 text-center">{u.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white">
            <h3 className="px-5 pt-5 font-semibold">Detalle de citas</h3>
            <div className="overflow-x-auto p-2">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Fecha y hora</th>
                    <th className="px-3 py-2">Paciente</th>
                    <th className="px-3 py-2">Médico</th>
                    <th className="px-3 py-2">Especialidad</th>
                    <th className="px-3 py-2">Estado</th>
                    <th className="px-3 py-2">Registró</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.slice(0, FILAS_DETALLE).map((c) => (
                    <tr key={c.idCita} className="border-t border-slate-100">
                      <td className="px-3 py-2">
                        {formatoFechaHora(c.fechaHoraCita)}
                      </td>
                      <td className="px-3 py-2">
                        {c.paciente}{" "}
                        <span className="text-xs text-slate-400">
                          ({c.dniPaciente})
                        </span>
                      </td>
                      <td className="px-3 py-2">{c.medico}</td>
                      <td className="px-3 py-2 text-slate-600">
                        {c.especialidad}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${estiloEstado(c.estado)}`}
                        >
                          {etiquetaEstado(c.estado)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {c.registradoPor}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {detalle.length > FILAS_DETALLE && (
              <p className="px-5 pb-4 text-xs text-slate-500">
                Mostrando {FILAS_DETALLE} de {detalle.length} citas. El PDF, el
                Excel y el CSV incluyen todas.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
