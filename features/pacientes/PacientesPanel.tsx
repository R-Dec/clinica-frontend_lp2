"use client";

import { CalendarPlus, Pencil, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import Alerta from "@/components/ui/Alerta";
import { useApi } from "@/lib/useApi";
import { useCarga } from "@/lib/useCarga";
import PacienteModal from "./PacienteModal";
import { listarPacientes } from "./service";
import type { Paciente } from "./types";

export default function PacientesPanel() {
	const api = useApi();
	const [busqueda, setBusqueda] = useState("");
	const [modal, setModal] = useState<Paciente | "nuevo" | null>(null);

	const cargar = useCallback(() => listarPacientes(api), [api]);
	const { datos, error, cargando, recargar } = useCarga(cargar);

	const texto = busqueda.trim().toLowerCase();
	const visibles = datos?.filter((p) =>
		`${p.nombre} ${p.apellido} ${p.dni}`.toLowerCase().includes(texto),
	);

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="relative w-full max-w-sm">
					<Search
						size={16}
						className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
					/>
					<input
						type="search"
						aria-label="Buscar paciente"
						placeholder="Buscar por DNI o nombre"
						value={busqueda}
						onChange={(e) => setBusqueda(e.target.value)}
						className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-sky-600 focus:outline-none"
					/>
				</div>
				<button
					type="button"
					onClick={() => setModal("nuevo")}
					className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800"
				>
					<Plus size={16} />
					Nuevo paciente
				</button>
			</div>

			<Alerta mensaje={error} />

			<div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
				<table className="w-full text-left text-sm">
					<thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
						<tr>
							<th className="px-4 py-3">DNI</th>
							<th className="px-4 py-3">Paciente</th>
							<th className="px-4 py-3">Teléfono</th>
							<th className="px-4 py-3">Registrado por</th>
							<th className="px-4 py-3">Acciones</th>
						</tr>
					</thead>
					<tbody>
						{cargando && (
							<tr>
								<td
									colSpan={5}
									className="px-4 py-6 text-center text-slate-500"
								>
									Cargando...
								</td>
							</tr>
						)}
						{visibles?.length === 0 && (
							<tr>
								<td
									colSpan={5}
									className="px-4 py-6 text-center text-slate-500"
								>
									No se encontraron pacientes.
								</td>
							</tr>
						)}
						{visibles?.map((p) => (
							<tr
								key={p.idPaciente}
								className="border-b border-slate-100 last:border-0"
							>
								<td className="px-4 py-3 font-medium">{p.dni}</td>
								<td className="px-4 py-3">
									{p.nombre} {p.apellido}
								</td>
								<td className="px-4 py-3 text-slate-600">
									{p.telefono ?? "—"}
								</td>
								<td className="px-4 py-3 text-slate-600">
									{p.nombreUsuarioRegistro
										? `${p.nombreUsuarioRegistro} ${p.apellidoUsuarioRegistro ?? ""}`
										: "—"}
								</td>
								<td className="px-4 py-3">
									<div className="flex gap-3">
										<button
											type="button"
											onClick={() => setModal(p)}
											className="inline-flex items-center gap-1 text-sky-700 hover:underline"
										>
											<Pencil size={14} />
											Editar
										</button>
										<Link
											href={`/agendar-cita?dni=${p.dni}`}
											className="inline-flex items-center gap-1 text-sky-700 hover:underline"
										>
											<CalendarPlus size={14} />
											Agendar cita
										</Link>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{modal && (
				<PacienteModal
					inicial={modal === "nuevo" ? null : modal}
					onClose={() => setModal(null)}
					onGuardado={() => {
						setModal(null);
						recargar();
					}}
				/>
			)}
		</div>
	);
}
