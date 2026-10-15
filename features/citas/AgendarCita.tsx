"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Search, UserPlus } from "lucide-react";
import Alerta from "@/components/ui/Alerta";
import { listarEspecialidades } from "@/features/especialidades/service";
import PacienteModal from "@/features/pacientes/PacienteModal";
import { buscarPacientePorDni } from "@/features/pacientes/service";
import type { Paciente } from "@/features/pacientes/types";
import { ApiError, mensajeDeError } from "@/lib/api";
import { formatoFecha, formatoHora, hoyISO } from "@/lib/fechas";
import { useApi } from "@/lib/useApi";
import { useCarga } from "@/lib/useCarga";
import SelectorHorario, { type SeleccionHorario } from "./SelectorHorario";
import { registrarCita } from "./service";
import type { Cita } from "./types";

const CLASE_CAMPO =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-600 focus:outline-none disabled:bg-slate-100";

function Seccion({
  numero,
  titulo,
  children,
}: {
  numero: number;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="flex items-center gap-2 font-semibold">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs text-sky-700">
          {numero}
        </span>
        {titulo}
      </h3>
      {children}
    </section>
  );
}

export default function AgendarCita() {
  const api = useApi();
  const dniParam = useSearchParams().get("dni") ?? "";

  const [dni, setDni] = useState(dniParam);
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [noExiste, setNoExiste] = useState(false);
  const [errorPaciente, setErrorPaciente] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [modalPaciente, setModalPaciente] = useState(false);

  const [idEspecialidad, setIdEspecialidad] = useState("");
  const [fecha, setFecha] = useState(hoyISO());
  const [seleccion, setSeleccion] = useState<SeleccionHorario | null>(null);
  const [version, setVersion] = useState(0);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [creada, setCreada] = useState<Cita | null>(null);

  const cargarEspecialidades = useCallback(
    () => listarEspecialidades(api, true),
    [api],
  );
  const especialidades = useCarga(cargarEspecialidades);

  // Si llega ?dni=... (desde Pacientes), busca el paciente automáticamente.
  useEffect(() => {
    if (!/^\d{8}$/.test(dniParam)) return;
    let cancelado = false;
    buscarPacientePorDni(api, dniParam)
      .then((p) => {
        if (!cancelado) setPaciente(p);
      })
      .catch((err) => {
        if (cancelado) return;
        if (err instanceof ApiError && err.status === 404) setNoExiste(true);
        else setErrorPaciente(mensajeDeError(err));
      });
    return () => {
      cancelado = true;
    };
  }, [api, dniParam]);

  async function buscar(e: FormEvent) {
    e.preventDefault();
    const valor = dni.trim();
    setErrorPaciente("");
    setNoExiste(false);
    setPaciente(null);
    setSeleccion(null);
    if (!/^\d{8}$/.test(valor)) {
      setErrorPaciente("El DNI debe tener 8 dígitos.");
      return;
    }
    setBuscando(true);
    try {
      setPaciente(await buscarPacientePorDni(api, valor));
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) setNoExiste(true);
      else setErrorPaciente(mensajeDeError(err));
    } finally {
      setBuscando(false);
    }
  }

  async function confirmar() {
    if (!paciente || !seleccion) return;
    setGuardando(true);
    setError("");
    try {
      const cita = await registrarCita(api, {
        idPaciente: paciente.idPaciente,
        idMedico: seleccion.idMedico,
        fechaHoraCita: seleccion.fechaHora,
      });
      setCreada(cita);
    } catch (err) {
      setError(mensajeDeError(err));
      if (err instanceof ApiError && err.status === 409) {
        // Alguien ocupó ese horario: se vuelve a consultar la disponibilidad.
        setSeleccion(null);
        setVersion((v) => v + 1);
      }
    } finally {
      setGuardando(false);
    }
  }

  function reiniciar() {
    setCreada(null);
    setPaciente(null);
    setDni("");
    setNoExiste(false);
    setIdEspecialidad("");
    setSeleccion(null);
    setError("");
    setVersion((v) => v + 1);
  }

  if (creada) {
    return (
      <div className="mx-auto max-w-xl space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-center gap-2 text-emerald-700">
          <CheckCircle2 size={22} />
          <h2 className="text-lg font-bold">Cita registrada</h2>
        </div>
        <dl className="space-y-1 text-sm">
          <div>
            <dt className="inline font-medium">Paciente: </dt>
            <dd className="inline">
              {creada.nombrePaciente} {creada.apellidoPaciente} (DNI{" "}
              {creada.dniPaciente})
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">Especialidad: </dt>
            <dd className="inline">{creada.nombreEspecialidad}</dd>
          </div>
          <div>
            <dt className="inline font-medium">Médico: </dt>
            <dd className="inline">
              {creada.nombreMedico} {creada.apellidoMedico}
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">Fecha y hora: </dt>
            <dd className="inline">
              {formatoFecha(creada.fechaHoraCita)} a las{" "}
              {formatoHora(creada.fechaHoraCita)}
            </dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={reiniciar}
            className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800"
          >
            Agendar otra cita
          </button>
          <Link
            href="/citas"
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Ver citas registradas
          </Link>
        </div>
      </div>
    );
  }

  const espSeleccionada = especialidades.datos?.find(
    (e) => String(e.idEspecialidad) === idEspecialidad,
  );
  const fechaValida = fecha !== "" && fecha >= hoyISO();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Seccion numero={1} titulo="Buscar paciente">
        <form onSubmit={buscar} className="flex flex-wrap gap-2">
          <div className="relative min-w-48 flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              aria-label="DNI del paciente"
              inputMode="numeric"
              maxLength={8}
              placeholder="DNI (8 dígitos)"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              className={`${CLASE_CAMPO} pl-9`}
            />
          </div>
          <button
            type="submit"
            disabled={buscando}
            className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-50"
          >
            {buscando ? "Buscando..." : "Buscar"}
          </button>
          <button
            type="button"
            onClick={() => setModalPaciente(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-sky-700 px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50"
          >
            <UserPlus size={16} />
            Nuevo
          </button>
        </form>

        <Alerta mensaje={errorPaciente} />

        {noExiste && (
          <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
            No existe un paciente con ese DNI.{" "}
            <button
              type="button"
              onClick={() => setModalPaciente(true)}
              className="font-semibold underline"
            >
              Registrarlo ahora
            </button>
          </p>
        )}

        {paciente && (
          <div className="rounded-lg bg-sky-50 p-3 text-sm">
            <p className="font-semibold">
              {paciente.nombre} {paciente.apellido}
            </p>
            <p className="text-slate-600">
              DNI {paciente.dni}
              {paciente.telefono ? ` · ${paciente.telefono}` : ""}
            </p>
          </div>
        )}
      </Seccion>

      <Seccion numero={2} titulo="Especialidad y fecha">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="cita-esp"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Especialidad
            </label>
            <select
              id="cita-esp"
              disabled={!paciente}
              value={idEspecialidad}
              onChange={(e) => {
                setIdEspecialidad(e.target.value);
                setSeleccion(null);
              }}
              className={CLASE_CAMPO}
            >
              <option value="">Selecciona una especialidad</option>
              {especialidades.datos?.map((esp) => (
                <option key={esp.idEspecialidad} value={esp.idEspecialidad}>
                  {esp.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="cita-fecha"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Fecha
            </label>
            <input
              id="cita-fecha"
              type="date"
              min={hoyISO()}
              disabled={!paciente}
              value={fecha}
              onChange={(e) => {
                setFecha(e.target.value);
                setSeleccion(null);
              }}
              className={CLASE_CAMPO}
            />
          </div>
        </div>
        <Alerta mensaje={especialidades.error} />
      </Seccion>

      <Seccion numero={3} titulo="Horario y médico">
        {paciente && idEspecialidad && fechaValida ? (
          <SelectorHorario
            key={`${idEspecialidad}|${fecha}|${version}`}
            idEspecialidad={Number(idEspecialidad)}
            fecha={fecha}
            onChange={setSeleccion}
          />
        ) : (
          <p className="text-sm text-slate-500">
            Busca un paciente y elige la especialidad y la fecha para ver los
            horarios.
          </p>
        )}
      </Seccion>

      {paciente && seleccion && (
        <section className="space-y-3 rounded-xl border border-sky-200 bg-sky-50 p-5">
          <h3 className="font-semibold">Resumen</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <span className="font-medium">Paciente:</span> {paciente.nombre}{" "}
              {paciente.apellido} (DNI {paciente.dni})
            </li>
            <li>
              <span className="font-medium">Especialidad:</span>{" "}
              {espSeleccionada?.nombre}
            </li>
            <li>
              <span className="font-medium">Médico:</span>{" "}
              {seleccion.nombreMedico}
            </li>
            <li>
              <span className="font-medium">Fecha y hora:</span>{" "}
              {formatoFecha(seleccion.fechaHora)} a las{" "}
              {formatoHora(seleccion.fechaHora)} (45 min)
            </li>
          </ul>
          <Alerta mensaje={error} />
          <button
            type="button"
            disabled={guardando}
            onClick={confirmar}
            className="rounded-lg bg-sky-700 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-50"
          >
            {guardando ? "Registrando..." : "Confirmar cita"}
          </button>
        </section>
      )}

      {!seleccion && error && <Alerta mensaje={error} />}

      {modalPaciente && (
        <PacienteModal
          inicial={null}
          dniInicial={/^\d{8}$/.test(dni.trim()) ? dni.trim() : ""}
          onClose={() => setModalPaciente(false)}
          onGuardado={(p) => {
            setPaciente(p);
            setDni(p.dni);
            setNoExiste(false);
            setErrorPaciente("");
            setModalPaciente(false);
          }}
        />
      )}
    </div>
  );
}
