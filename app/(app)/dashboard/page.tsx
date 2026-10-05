"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, ShieldCheck, Stethoscope } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useApi } from "../../lib/useApi";
import { mensajeDeError } from "../../lib/api";
import { etiquetaRol } from "../../lib/navigation";
import { Especialidad } from "../../lib/types";

const MODULOS = [
  { nombre: "Inicio de sesión y roles", listo: true },
  { nombre: "Especialidades", listo: true },
  { nombre: "Pacientes", listo: false },
  { nombre: "Médicos y disponibilidad de horarios", listo: false },
  { nombre: "Citas", listo: false },
  { nombre: "Reportes", listo: false },
];

function saludo() {
  const hora = new Date().getHours();
  if (hora < 12) return "Buenos días";
  if (hora < 19) return "Buenas tardes";
  return "Buenas noches";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const api = useApi();
  const [activas, setActivas] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelado = false;
    api<Especialidad[]>("/especialidades/activas")
      .then((datos) => {
        if (!cancelado) setActivas(datos.length);
      })
      .catch((e) => {
        if (!cancelado) setError(mensajeDeError(e));
      });
    return () => {
      cancelado = true;
    };
  }, [api]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-sky-700">Resumen operativo</p>
        <h2 className="text-3xl font-bold">
          {saludo()}, {user.nombre}
        </h2>
        <p className="text-slate-500">
          Aquí tienes el estado actual de tu clínica.
        </p>
      </section>

      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <Stethoscope className="mb-3 text-sky-700" size={22} />
          <p className="text-sm text-slate-500">Especialidades activas</p>
          <p className="text-3xl font-bold">{activas ?? "—"}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <ShieldCheck className="mb-3 text-sky-700" size={22} />
          <p className="text-sm text-slate-500">Tu rol</p>
          <p className="text-xl font-bold">{etiquetaRol(user.rol)}</p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 font-semibold">Estado de integración</h3>
        <ul className="space-y-2 text-sm">
          {MODULOS.map((m) => (
            <li key={m.nombre} className="flex items-center gap-2">
              {m.listo ? (
                <CheckCircle2 size={16} className="text-emerald-600" />
              ) : (
                <Clock size={16} className="text-slate-400" />
              )}
              <span className={m.listo ? "" : "text-slate-500"}>
                {m.nombre}
              </span>
              <span className="ml-auto text-xs text-slate-400">
                {m.listo ? "Conectado" : "Esperando backend"}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
