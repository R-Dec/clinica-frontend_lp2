"use client";

import { useState } from "react";
import Alerta from "@/components/ui/Alerta";
import Modal from "@/components/ui/Modal";
import type { Especialidad } from "@/features/especialidades/types";
import { ApiError, mensajeDeError } from "@/lib/api";
import { formatoFechaHora, hoyISO } from "@/lib/fechas";
import { useApi } from "@/lib/useApi";
import SelectorHorario, { type SeleccionHorario } from "./SelectorHorario";
import { reprogramarCita } from "./service";
import type { Cita } from "./types";

interface Props {
  cita: Cita;
  especialidades: Especialidad[];
  onClose: () => void;
  onGuardado: () => void;
}

export default function ReprogramarModal({
  cita,
  especialidades,
  onClose,
  onGuardado,
}: Props) {
  const api = useApi();
  const hoy = hoyISO();
  const fechaCita = cita.fechaHoraCita.slice(0, 10);

  const [fecha, setFecha] = useState(fechaCita >= hoy ? fechaCita : hoy);
  const [seleccion, setSeleccion] = useState<SeleccionHorario | null>(null);
  const [version, setVersion] = useState(0);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  // El backend exige que el nuevo médico sea de la misma especialidad.
  const idEspecialidad = especialidades.find(
    (e) => e.nombre === cita.nombreEspecialidad,
  )?.idEspecialidad;

  async function confirmar() {
    if (!seleccion) return;
    setError("");
    setEnviando(true);
    try {
      await reprogramarCita(api, cita.idCita, {
        idMedico: seleccion.idMedico,
        fechaHoraCita: seleccion.fechaHora,
      });
      onGuardado();
    } catch (err) {
      setError(mensajeDeError(err));
      if (err instanceof ApiError && err.status === 409) {
        setSeleccion(null);
        setVersion((v) => v + 1);
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal titulo="Reprogramar cita" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-slate-700">
          <strong>
            {cita.nombrePaciente} {cita.apellidoPaciente}
          </strong>{" "}
          · {cita.nombreEspecialidad}
          <br />
          Actual: {cita.nombreMedico} {cita.apellidoMedico},{" "}
          {formatoFechaHora(cita.fechaHoraCita)}
        </p>

        {idEspecialidad === undefined ? (
          <Alerta
            mensaje={`La especialidad "${cita.nombreEspecialidad}" no está activa, no se puede reprogramar.`}
          />
        ) : (
          <>
            <div>
              <label
                htmlFor="rep-fecha"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Nueva fecha
              </label>
              <input
                id="rep-fecha"
                type="date"
                min={hoy}
                value={fecha}
                onChange={(e) => {
                  setFecha(e.target.value);
                  setSeleccion(null);
                }}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-600 focus:outline-none"
              />
            </div>

            {fecha >= hoy && (
              <SelectorHorario
                key={`${fecha}|${version}`}
                idEspecialidad={idEspecialidad}
                fecha={fecha}
                onChange={setSeleccion}
              />
            )}
          </>
        )}

        <Alerta mensaje={error} />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!seleccion || enviando}
            onClick={confirmar}
            className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-50"
          >
            {enviando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
