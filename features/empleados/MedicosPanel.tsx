"use client";

import { useCallback, useState } from "react";
import Alerta from "@/components/ui/Alerta";
import { listarEspecialidades } from "@/features/especialidades/service";
import { useApi } from "@/lib/useApi";
import { useCarga } from "@/lib/useCarga";
import { infoTurno } from "./constantes";
import { listarMedicos } from "./service";

export default function MedicosPanel() {
	const api = useApi();
	const [idEspecialidad, setIdEspecialidad] = useState<number | null>(null);

	const cargarEspecialidades = useCallback(
		() => listarEspecialidades(api, true),
		[api],
	);
	const cargarMedicos = useCallback(
		() => listarMedicos(api, idEspecialidad),
		[api, idEspecialidad],
	);

	const especialidades = useCarga(cargarEspecialidades);
	const medicos = useCarga(cargarMedicos);

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<p className="text-sm text-slate-500">
					Médicos activos y su turno de atención.
				</p>
				<div className="flex items-center gap-2">
					<label htmlFor="filtro-esp" className="text-sm text-slate-600">
						Especialidad
					</label>
					<select
						id="filtro-esp"
						value={idEspecialidad ?? ""}
						onChange={(e) =>
							setIdEspecialidad(e.target.value ? Number(e.target.value) : null)
						}
						className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-600 focus:outline-none"
					>
						<option value="">Todas</option>
						{especialidades.datos?.map((esp) => (
							<option key={esp.idEspecialidad} value={esp.idEspecialidad}>
								{esp.nombre}
							</option>
						))}
					</select>
				</div>
			</div>

			<Alerta mensaje={medicos.error || especialidades.error} />

			<div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
				<table className="w-full text-left text-sm">
					<thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
						<tr>
							<th className="px-4 py-3">Médico</th>
							<th className="px-4 py-3">Especialidad</th>
							<th className="px-4 py-3">Turno</th>
							<th className="px-4 py-3">Horario</th>
						</tr>
					</thead>
					<tbody>
						{medicos.cargando && (
							<tr>
								<td
									colSpan={4}
									className="px-4 py-6 text-center text-slate-500"
								>
									Cargando...
								</td>
							</tr>
						)}
						{medicos.datos?.length === 0 && (
							<tr>
								<td
									colSpan={4}
									className="px-4 py-6 text-center text-slate-500"
								>
									No hay médicos activos para este filtro.
								</td>
							</tr>
						)}
						{medicos.datos?.map((m) => {
							const turno = infoTurno(m.turno);
							return (
								<tr
									key={m.idEmpleado}
									className="border-b border-slate-100 last:border-0"
								>
									<td className="px-4 py-3 font-medium">
										{m.nombre} {m.apellido}
									</td>
									<td className="px-4 py-3 text-slate-600">
										{m.especialidad ?? "—"}
									</td>
									<td className="px-4 py-3">
										<span
											className={`rounded-full px-2.5 py-1 text-xs font-medium ${
												m.turno === "NOCTURNO"
													? "bg-indigo-50 text-indigo-700"
													: "bg-amber-50 text-amber-700"
											}`}
										>
											{turno?.etiqueta ?? "—"}
										</span>
									</td>
									<td className="px-4 py-3 text-slate-600">
										{turno?.horario ?? "—"}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}
