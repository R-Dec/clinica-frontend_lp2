"use client";

import { useCallback, useState } from "react";
import Alerta from "@/components/ui/Alerta";
import { formatoHora } from "@/lib/fechas";
import { useApi } from "@/lib/useApi";
import { useCarga } from "@/lib/useCarga";
import { consultarDisponibilidad } from "./service";
import type { Disponibilidad } from "./types";

export interface SeleccionHorario {
  fechaHora: string;
  idMedico: number;
  nombreMedico: string;
}

interface Props {
  idEspecialidad: number;
  fecha: string;
  onChange: (seleccion: SeleccionHorario | null) => void;
}

const FRANJAS = [
  {
    id: "madrugada",
    titulo: "Madrugada · turno nocturno",
    test: (h: number) => h < 6,
  },
  {
    id: "dia",
    titulo: "Día · turno diurno",
    test: (h: number) => h >= 6 && h < 18,
  },
  {
    id: "noche",
    titulo: "Noche · turno nocturno",
    test: (h: number) => h >= 18,
  },
];

export default function SelectorHorario({
  idEspecialidad,
  fecha,
  onChange,
}: Props) {
  const api = useApi();
  const cargar = useCallback(
    () => consultarDisponibilidad(api, idEspecialidad, fecha),
    [api, idEspecialidad, fecha],
  );
  const { datos, error, cargando } = useCarga(cargar);
  const [hora, setHora] = useState<string | null>(null);
  const [idMedico, setIdMedico] = useState<number | null>(null);

  if (error) return <Alerta mensaje={error} />;
  if (cargando)
    return <p className="text-sm text-slate-500">Consultando horarios...</p>;
  if (!datos || datos.length === 0) {
    return (
      <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
        No hay horarios disponibles para esa fecha. Prueba con otro día.
      </p>
    );
  }

  const horaActual: Disponibilidad | undefined = datos.find(
    (d) => d.fechaHora === hora,
  );

  function elegirHora(fechaHora: string) {
    setHora(fechaHora);
    setIdMedico(null);
    onChange(null);
  }

  return (
    <div className="space-y-4">
      {FRANJAS.map((franja) => {
        const horas = datos.filter((d) =>
          franja.test(Number(d.fechaHora.slice(11, 13))),
        );
        if (horas.length === 0) return null;
        return (
          <div key={franja.id}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {franja.titulo}
            </p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {horas.map((d) => (
                <button
                  key={d.fechaHora}
                  type="button"
                  aria-pressed={hora === d.fechaHora}
                  onClick={() => elegirHora(d.fechaHora)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                    hora === d.fechaHora
                      ? "border-sky-700 bg-sky-700 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:border-sky-600"
                  }`}
                >
                  {formatoHora(d.fechaHora)}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {horaActual && (
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">
            Médicos disponibles a las {formatoHora(horaActual.fechaHora)}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {horaActual.medicos.map((m) => (
              <button
                key={m.idMedico}
                type="button"
                aria-pressed={idMedico === m.idMedico}
                onClick={() => {
                  setIdMedico(m.idMedico);
                  onChange({
                    fechaHora: horaActual.fechaHora,
                    idMedico: m.idMedico,
                    nombreMedico: `${m.nombre} ${m.apellido}`,
                  });
                }}
                className={`rounded-lg border px-4 py-3 text-left text-sm ${
                  idMedico === m.idMedico
                    ? "border-sky-700 bg-sky-50 font-semibold text-sky-800"
                    : "border-slate-300 bg-white hover:border-sky-600"
                }`}
              >
                {m.nombre} {m.apellido}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
