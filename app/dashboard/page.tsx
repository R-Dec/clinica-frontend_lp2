"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [resultado, setResultado] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  async function probarToken() {
    if (!user) return;
    try {
      const data = await apiFetch<unknown>("/usuarios/perfil", user.token);
      setResultado(JSON.stringify(data, null, 2));
    } catch (err) {
      if ((err as Error).message === "UNAUTHORIZED") {
        logout(); // token vencido o inválido
      } else {
        setResultado((err as Error).message);
      }
    }
  }

  if (loading || !user) return <p className="p-8 text-center">Cargando...</p>;

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Bienvenido, {user.nombre} {user.apellido}
        </h1>
        <button
          type="button"
          onClick={logout}
          className="rounded-md bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
        >
          Cerrar sesión
        </button>
      </header>

      <section className="space-y-1 rounded-lg border p-4">
        <p>
          <strong>Correo:</strong> {user.correo}
        </p>
        <p>
          <strong>Rol:</strong> {user.rol}
        </p>
        <p>
          <strong>ID usuario:</strong> {user.idUsuario}
        </p>
        <p className="break-all text-xs text-slate-500">
          <strong>Token:</strong> {user.token}
        </p>
      </section>

      <section className="space-y-3 rounded-lg border p-4">
        <button
          type="button"
          onClick={probarToken}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Probar endpoint protegido (/usuarios/perfil)
        </button>
        {resultado && (
          <pre className="rounded bg-slate-100 p-3 text-sm">{resultado}</pre>
        )}
      </section>
    </main>
  );
}
