"use client";

import Link from "next/link";
import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../lib/useApi";
import Sidebar from "../components/Sidebar";
import { iniciales, itemsParaRol, NAV_ITEMS } from "../lib/navigation";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const api = useApi();

  const itemActual = NAV_ITEMS.find(
    (i) => pathname === i.href || pathname.startsWith(`${i.href}/`),
  );
  const sinAcceso =
    !!user && !!itemActual && !itemActual.roles.includes(user.rol);

  // Sin sesión → login
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  // Rol sin permiso para esta pantalla → dashboard
  useEffect(() => {
    if (sinAcceso) router.replace("/dashboard");
  }, [sinAcceso, router]);

  // Verifica que el token siga vigente (si no, useApi cierra la sesión)
  useEffect(() => {
    if (user) api("/usuarios/perfil").catch(() => undefined);
  }, [user, api]);

  if (loading || !user || sinAcceso) {
    return <p className="p-8 text-center text-slate-500">Cargando...</p>;
  }

  const items = itemsParaRol(user.rol);
  const fecha = new Date().toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar items={items} user={user} onLogout={logout} />

      <div className="flex min-w-0 flex-1 flex-col">
        <nav className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white p-2 md:hidden">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${
                itemActual?.href === item.href
                  ? "bg-sky-700 text-white"
                  : "text-slate-600"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">{itemActual?.label}</h1>
            <p className="text-sm capitalize text-slate-500">{fecha}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={logout}
              aria-label="Cerrar sesión"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
            >
              <LogOut size={18} />
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">
              {iniciales(user.nombre, user.apellido)}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
