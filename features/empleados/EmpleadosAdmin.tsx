"use client";

import { Pencil, Plus, Power, Search } from "lucide-react";
import { useCallback, useState } from "react";
import Alerta from "@/components/ui/Alerta";
import { listarEspecialidades } from "@/features/especialidades/service";
import { mensajeDeError } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { useCarga } from "@/lib/useCarga";
import { etiquetaCargo, infoTurno } from "./constantes";
import EmpleadoModal from "./EmpleadoModal";
import {
	cambiarEstadoEmpleado,
	listarCargos,
	listarEmpleados,
} from "./service";
import type { Empleado } from "./types";

export default function EmpleadosAdmin() {
	const api = useApi();
	const [busqueda, setBusqueda] = useState("");
	const [modal, setModal] = useState<Empleado | "nuevo" | null>(null);

	const cargarEmpleados = useCallback(() => listarEmpleados(api), [api]);
	const cargarCargos = useCallback(() => listarCargos(api), [api]);
	const cargarEspecialidades = useCallback(
		() => listarEspecialidades(api, true),
		[api],
	);

	const empleados = useCarga(cargarEmpleados);
	const cargos = useCarga(cargarCargos);
	const especialidades = useCarga(cargarEspecialidades);

	const texto = busqueda.trim().toLowerCase();
	const visibles = empleados.datos?.filter((e) =>
		`${e.nombre} ${e.apellido} ${e.dni} ${e.cargo}`
			.toLowerCase()
			.includes(texto),
	);

	async function alternarEstado(emp: Empleado) {
		try {
			await cambiarEstadoEmpleado(api, emp.idEmpleado, !emp.estado);
			await empleados.recargar();
		} catch (e) {
			empleados.setError(mensajeDeError(e));
		}
	}

	const listoParaCrear = cargos.datos !== null && especialidades.datos !== null;

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
						aria-label="Buscar empleado"
						placeholder="Buscar por nombre, DNI o cargo"
						value={busqueda}
						onChange={(e) => setBusqueda(e.target.value)}
						className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-sky-600 focus:outline-none"
					/>
				</div>
				<button
					type="button"
					disabled={!listoParaCrear}
					onClick={() => setModal("nuevo")}
					className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-50"
				>
					<Plus size={16} />
					Nuevo empleado
				</button>
			</div>

			<Alerta
				mensaje={empleados.error || cargos.error || especialidades.error}
			/>

			<div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
				<table className="w-full text-left text-sm">
					<thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
						<tr>
							<th className="px-4 py-3">Empleado</th>
							<th className="px-4 py-3">DNI</th>
							<th className="px-4 py-3">Cargo</th>
							<th className="px-4 py-3">Especialidad</th>
							<th className="px-4 py-3">Turno</th>
							<th className="px-4 py-3">Estado</th>
							<th className="px-4 py-3">Acciones</th>
						</tr>
					</thead>
					<tbody>
						{empleados.cargando && (
							<tr>
								<td
									colSpan={7}
									className="px-4 py-6 text-center text-slate-500"
								>
									Cargando...
								</td>
							</tr>
						)}
						{visibles?.length === 0 && (
							<tr>
								<td
									colSpan={7}
									className="px-4 py-6 text-center text-slate-500"
								>
									No se encontraron empleados.
								</td>
							</tr>
						)}
						{visibles?.map((emp) => (
							<tr
								key={emp.idEmpleado}
								className="border-b border-slate-100 last:border-0"
							>
								<td className="px-4 py-3 font-medium">
									{emp.nombre} {emp.apellido}
								</td>
								<td className="px-4 py-3 text-slate-600">{emp.dni}</td>
								<td className="px-4 py-3 text-slate-600">
									{etiquetaCargo(emp.cargo)}
								</td>
								<td className="px-4 py-3 text-slate-600">
									{emp.especialidad ?? "—"}
								</td>
								<td className="px-4 py-3 text-slate-600">
									{infoTurno(emp.turno)?.etiqueta ?? "—"}
								</td>
								<td className="px-4 py-3">
									<span
										className={`rounded-full px-2.5 py-1 text-xs font-medium ${
											emp.estado
												? "bg-emerald-50 text-emerald-700"
												: "bg-slate-100 text-slate-500"
										}`}
									>
										{emp.estado ? "Activo" : "Inactivo"}
									</span>
								</td>
								<td className="px-4 py-3">
									<div className="flex gap-3">
										<button
											type="button"
											disabled={!listoParaCrear}
											onClick={() => setModal(emp)}
											className="inline-flex items-center gap-1 text-sky-700 hover:underline disabled:opacity-50"
										>
											<Pencil size={14} />
											Editar
										</button>
										<button
											type="button"
											onClick={() => alternarEstado(emp)}
											className="inline-flex items-center gap-1 text-sky-700 hover:underline"
										>
											<Power size={14} />
											{emp.estado ? "Desactivar" : "Activar"}
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{modal && cargos.datos && especialidades.datos && (
				<EmpleadoModal
					inicial={modal === "nuevo" ? null : modal}
					cargos={cargos.datos}
					especialidades={especialidades.datos}
					onClose={() => setModal(null)}
					onGuardado={() => {
						setModal(null);
						empleados.recargar();
					}}
				/>
			)}
		</div>
	);
}
