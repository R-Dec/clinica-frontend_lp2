"use client";

import { useAuth } from "@/features/auth/AuthContext";
import UsuariosAdmin from "@/features/usuarios/UsuariosAdmin";
import { etiquetaRol } from "@/lib/navigation";

export default function ConfiguracionPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 font-semibold">Mi cuenta</h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-slate-500">Nombre</dt>
            <dd className="font-medium">
              {user.nombre} {user.apellido}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Correo</dt>
            <dd className="font-medium">{user.correo}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Rol</dt>
            <dd className="font-medium">{etiquetaRol(user.rol)}</dd>
          </div>
        </dl>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Usuarios del sistema</h2>
        <UsuariosAdmin />
      </section>
    </div>
  );
}
