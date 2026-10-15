"use client";

import Link from "next/link";
import { useCallback } from "react";
import {
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  UserRound,
} from "lucide-react";
import Alerta from "@/components/ui/Alerta";
import { useAuth } from "@/features/auth/AuthContext";
import {
  ESTADO_ATENDIDA,
  ESTADO_PENDIENTE,
  estiloEstado,
  etiquetaEstado,
} from "@/features/citas/constantes";
import { listarCitas } from "@/features/citas/service";
import { listarMedicos } from "@/features/empleados/service";
import { esFuturo, formatoHora, hoyISO } from "@/lib/fechas";
import { ROL_ADMIN } from "@/lib/navigation";
import { useApi } from "@/lib/useApi";
import { useCarga } from "@/lib/useCarga";

function saludo() {
  const hora = new Date().getHours();
  if (hora < 12) return "Buenos días";
  if (hora < 19) return "Buenas tardes";
  return "Buenas noches";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const api = useApi();

  const cargar = useCallback(async () => {
    const [citas, medicos] = await Promise.all([
      listarCitas(api),
      listarMedicos(api),
    ]);
    return { citas, medicos: medicos.length };
  }, [api]);

  const { datos, error } = useCarga(cargar);

  if (!user) return null;

  const hoy = hoyISO();
  const citasHoy = (datos?.citas ?? [])
    .filter((c) => c.fechaHoraCita.startsWith(hoy))
    .sort((a, b) => a.fechaHoraCita.localeCompare(b.fechaHoraCita));
  const pendientes = (datos?.citas ?? []).filter(
    (c) => c.estado === ESTADO_PENDIENTE && esFuturo(c.fechaHoraCita),
  ).length;
  const atendidasHoy = citasHoy.filter(
    (c) => c.estado === ESTADO_ATENDIDA,
  ).length;

  const tarjetas = [
    {
      icono: CalendarCheck,
      etiqueta: "Citas de hoy",
      valor: datos ? citasHoy.length : null,
    },
    {
      icono: CalendarClock,
      etiqueta: "Pendientes próximas",
      valor: datos ? pendientes : null,
    },
    {
      icono: CalendarCheck,
      etiqueta: "Atendidas hoy",
      valor: datos ? atendidasHoy : null,
    },
    {
      icono: UserRound,
      etiqueta: "Médicos activos",
      valor: datos?.medicos ?? null,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-sky-700">Resumen operativo</p>
          <h2 className="text-3xl font-bold">
            {saludo()}, {user.nombre}
          </h2>
          <p className="text-slate-500">
            {user.rol === ROL_ADMIN
              ? "Mostrando todas las citas de la clínica."
              : "Mostrando las citas que tú registraste."}
          </p>
        </div>
        <Link
          href="/agendar-cita"
          className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800"
        >
          <CalendarPlus size={16} />
          Agendar una cita
        </Link>
      </section>

      <Alerta mensaje={error} />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tarjetas.map((t) => {
          const Icono = t.icono;
          return (
            <div
              key={t.etiqueta}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <Icono className="mb-3 text-sky-700" size={22} />
              <p className="text-sm text-slate-500">{t.etiqueta}</p>
              <p className="text-3xl font-bold">{t.valor ?? "—"}</p>
            </div>
          );
        })}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="font-semibold">Citas de hoy</h3>
          <Link href="/citas" className="text-sm text-sky-700 hover:underline">
            Ver todas
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Hora</th>
                <th className="px-5 py-3">Paciente</th>
                <th className="px-5 py-3">Médico</th>
                <th className="px-5 py-3">Especialidad</th>
                <th className="px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {!datos && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-6 text-center text-slate-500"
                  >
                    Cargando...
                  </td>
                </tr>
              )}
              {datos && citasHoy.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-6 text-center text-slate-500"
                  >
                    No hay citas para hoy.
                  </td>
                </tr>
              )}
              {citasHoy.map((c) => (
                <tr
                  key={c.idCita}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-5 py-3 font-medium">
                    {formatoHora(c.fechaHoraCita)}
                  </td>
                  <td className="px-5 py-3">
                    {c.nombrePaciente} {c.apellidoPaciente}
                  </td>
                  <td className="px-5 py-3">
                    {c.nombreMedico} {c.apellidoMedico}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {c.nombreEspecialidad}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${estiloEstado(c.estado)}`}
                    >
                      {etiquetaEstado(c.estado)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
