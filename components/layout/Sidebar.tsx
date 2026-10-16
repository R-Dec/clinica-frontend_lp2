"use client";

import { Activity, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LoginResponse } from "@/features/auth/types";
import { etiquetaRol, iniciales, type NavItem } from "@/lib/navigation";

interface Props {
	items: NavItem[];
	user: LoginResponse;
	onLogout: () => void;
}

export default function Sidebar({ items, user, onLogout }: Props) {
	const pathname = usePathname();

	return (
		<aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
			<div className="flex items-center gap-3 p-5">
				<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-700 text-white">
					<Activity size={22} />
				</div>
				<div className="leading-tight">
					<p className="font-bold">Clínica Salud</p>
					<p className="font-bold text-sky-700">&amp; Vida</p>
				</div>
			</div>

			<p className="px-5 pb-2 pt-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
				Menú principal
			</p>

			<nav className="flex-1 space-y-1 px-3">
				{items.map((item) => {
					const activo =
						pathname === item.href || pathname.startsWith(`${item.href}/`);
					const Icono = item.icon;
					return (
						<Link
							key={item.href}
							href={item.href}
							className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
								activo
									? "bg-sky-700 text-white"
									: "text-slate-600 hover:bg-slate-100"
							}`}
						>
							<Icono size={18} />
							<span className="flex-1">{item.label}</span>
							{item.pendiente && (
								<span
									className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
										activo
											? "bg-white/20 text-white"
											: "bg-slate-100 text-slate-500"
									}`}
								>
									Pronto
								</span>
							)}
						</Link>
					);
				})}
			</nav>

			<div className="border-t border-slate-200 p-4">
				<div className="mb-3 flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">
						{iniciales(user.nombre, user.apellido)}
					</div>
					<div className="min-w-0 leading-tight">
						<p className="truncate text-sm font-semibold">
							{user.nombre} {user.apellido}
						</p>
						<p className="truncate text-xs text-slate-500">
							{etiquetaRol(user.rol)}
						</p>
					</div>
				</div>
				<button
					type="button"
					onClick={onLogout}
					className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
				>
					<LogOut size={18} />
					Cerrar sesión
				</button>
			</div>
		</aside>
	);
}
