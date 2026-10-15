"use client";

import { FormEvent, useCallback, useState } from "react";
import { listarMedicos } from "@/features/empleados/service";
import { listarEspecialidades } from "@/features/especialidades/service";
import { diasEntre, hoyISO, primerDiaDelMes, sumarDias } from "@/lib/fechas";
import { useApi } from "@/lib/useApi";
import { useCarga } from "@/lib/useCarga";
import ReporteVista from "./ReporteVista";
import type { FiltrosReporte } from "./types";

const MAX_DIAS = 366;
const CLASE_CAMPO =
  "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-600 focus:outline-none";

interface Aplicado {
  filtros: FiltrosReporte;
  etiquetaEspecialidad: string;
  etiquetaMedico: string;
  corrida: number;
}

export default function ReportesPanel() {
  const api = useApi();
  const [desde, setDesde] = useState(sumarDias(hoyISO(), -29));
  const [hasta, setHasta] = useState(hoyISO());
  const [idEspecialidad, setIdEspecialidad] = useState("");
  const [idMedico, setIdMedico] = useState("");

  const cargarEspecialidades = useCallback(
    () => listarEspecialidades(api, true),
    [api],
  );
  const cargarMedicos = useCallback(
    () => listarMedicos(api, idEspecialidad ? Number(idEspecialidad) : null),
    [api, idEspecialidad],
  );
  const especialidades = useCarga(cargarEspecialidades);
  const medicos = useCarga(cargarMedicos);

  const [aplicado, setAplicado] = useState<Aplicado>(() => ({
    filtros: {
      desde: sumarDias(hoyISO(), -29),
      hasta: hoyISO(),
      idEspecialidad: null,
      idMedico: null,
    },
    etiquetaEspecialidad: "Todas las especialidades",
    etiquetaMedico: "Todos los médicos",
    corrida: 0,
  }));

  const rangoInvalido = desde === "" || hasta === "" || desde > hasta;
  const rangoLargo = !rangoInvalido && diasEntre(desde, hasta) > MAX_DIAS;

  function generar(e: FormEvent) {
    e.preventDefault();
    if (rangoInvalido || rangoLargo) return;
    setAplicado((previo) => ({
      filtros: {
        desde,
        hasta,
        idEspecialidad: idEspecialidad ? Number(idEspecialidad) : null,
        idMedico: idMedico ? Number(idMedico) : null,
      },
      etiquetaEspecialidad:
        especialidades.datos?.find(
          (x) => String(x.idEspecialidad) === idEspecialidad,
        )?.nombre ?? "Todas las especialidades",
      etiquetaMedico: medicos.datos?.find(
        (x) => String(x.idEmpleado) === idMedico,
      )
        ? `${medicos.datos.find((x) => String(x.idEmpleado) === idMedico)?.nombre} ${
            medicos.datos.find((x) => String(x.idEmpleado) === idMedico)
              ?.apellido
          }`
        : "Todos los médicos",
      corrida: previo.corrida + 1,
    }));
  }

  function preset(dias: number) {
    setDesde(sumarDias(hoyISO(), -(dias - 1)));
    setHasta(hoyISO());
  }

  return (
    <div className="space-y-5">
      <form
        onSubmit={generar}
        className="space-y-3 rounded-xl border border-slate-200 bg-white p-5"
      >
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label
              htmlFor="rep-desde"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Desde
            </label>
            <input
              id="rep-desde"
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className={CLASE_CAMPO}
            />
          </div>
          <div>
            <label
              htmlFor="rep-hasta"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Hasta
            </label>
            <input
              id="rep-hasta"
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className={CLASE_CAMPO}
            />
          </div>
          <div>
            <label
              htmlFor="rep-esp"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Especialidad
            </label>
            <select
              id="rep-esp"
              value={idEspecialidad}
              onChange={(e) => {
                setIdEspecialidad(e.target.value);
                setIdMedico("");
              }}
              className={CLASE_CAMPO}
            >
              <option value="">Todas</option>
              {especialidades.datos?.map((x) => (
                <option key={x.idEspecialidad} value={x.idEspecialidad}>
                  {x.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="rep-med"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Médico
            </label>
            <select
              id="rep-med"
              value={idMedico}
              onChange={(e) => setIdMedico(e.target.value)}
              className={CLASE_CAMPO}
            >
              <option value="">Todos</option>
              {medicos.datos?.map((x) => (
                <option key={x.idEmpleado} value={x.idEmpleado}>
                  {x.nombre} {x.apellido}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={rangoInvalido || rangoLargo}
            className="rounded-lg bg-sky-700 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-50"
          >
            Generar reporte
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-slate-500">Atajos:</span>
          <button
            type="button"
            onClick={() => preset(7)}
            className="text-sky-700 hover:underline"
          >
            Últimos 7 días
          </button>
          <button
            type="button"
            onClick={() => preset(30)}
            className="text-sky-700 hover:underline"
          >
            Últimos 30 días
          </button>
          <button
            type="button"
            onClick={() => {
              setDesde(primerDiaDelMes());
              setHasta(hoyISO());
            }}
            className="text-sky-700 hover:underline"
          >
            Este mes
          </button>
        </div>

        {rangoInvalido && (
          <p className="text-sm text-red-600">
            La fecha "desde" debe ser anterior o igual a "hasta".
          </p>
        )}
        {rangoLargo && (
          <p className="text-sm text-red-600">
            El rango no puede superar {MAX_DIAS} días.
          </p>
        )}
      </form>

      <ReporteVista
        key={aplicado.corrida}
        filtros={aplicado.filtros}
        etiquetaEspecialidad={aplicado.etiquetaEspecialidad}
        etiquetaMedico={aplicado.etiquetaMedico}
      />
    </div>
  );
}
