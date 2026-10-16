"use client";

import { Pencil, Plus, Power } from "lucide-react";
import { useCallback, useState } from "react";
import Alerta from "@/components/ui/Alerta";
import { mensajeDeError } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { useCarga } from "@/lib/useCarga";
import EspecialidadModal from "./EspecialidadModal";
import { alternarEstadoEspecialidad, listarEspecialidades } from "./service";
import type { Especialidad } from "./types";

export default function EspecialidadesPanel({ esAdmin }: { esAdmin: boolean }) {
	const api = useApi();
	const cargar = useCallback(
		() => listarEspecialidades(api, !esAdmin),
		[api, esAdmin],
	);
	const { datos, error, cargando, recargar, setError } = useCarga(cargar);
	const [modal, setModal] = useState<Especialidad | "nueva" | null>(null);

	async function alternarEstado(esp: Especialidad) {
		try {
			await alternarEstadoEspecialidad(api, esp.idEspecialidad);
			await recargar();
		} catch (e) {
			setError(mensajeDeError(e));
		}
	}

	const columnas = esAdmin ? 4 : 2;

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<p className="text-sm text-slate-500">
					{esAdmin
						? "Administra las especialidades de la clínica."
						: "Especialidades disponibles para agendar citas."}
				</p>
				{esAdmin && (
					<button
						type="button"
						onClick={() => setModal("nueva")}
						className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800"
					>
						<Plus size={16} />
						Nueva especialidad
					</button>
				)}
			</div>

			<Alerta mensaje={error} />

			<div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
				<table className="w-full text-left text-sm">
					<thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
						<tr>
							<th className="px-4 py-3">Especialidad</th>
							<th className="px-4 py-3">Descripción</th>
							{esAdmin && (
								<>
									<th className="px-4 py-3">Estado</th>
									<th className="px-4 py-3">Acciones</th>
								</>
							)}
						</tr>
					</thead>
					<tbody>
						{cargando && (
							<tr>
								<td
									colSpan={columnas}
									className="px-4 py-6 text-center text-slate-500"
								>
									Cargando...
								</td>
							</tr>
						)}
						{datos?.length === 0 && (
							<tr>
								<td
									colSpan={columnas}
									className="px-4 py-6 text-center text-slate-500"
								>
									No hay especialidades registradas.
								</td>
							</tr>
						)}
						{datos?.map((esp) => (
							<tr
								key={esp.idEspecialidad}
								className="border-b border-slate-100 last:border-0"
							>
								<td className="px-4 py-3 font-medium">{esp.nombre}</td>
								<td className="px-4 py-3 text-slate-600">{esp.descripcion}</td>
								{esAdmin && (
									<>
										<td className="px-4 py-3">
											<span
												className={`rounded-full px-2.5 py-1 text-xs font-medium ${
													esp.estado
														? "bg-emerald-50 text-emerald-700"
														: "bg-slate-100 text-slate-500"
												}`}
											>
												{esp.estado ? "Activa" : "Inactiva"}
											</span>
										</td>
										<td className="px-4 py-3">
											<div className="flex gap-3">
												<button
													type="button"
													onClick={() => setModal(esp)}
													className="inline-flex items-center gap-1 text-sky-700 hover:underline"
												>
													<Pencil size={14} />
													Editar
												</button>
												<button
													type="button"
													onClick={() => alternarEstado(esp)}
													className="inline-flex items-center gap-1 text-sky-700 hover:underline"
												>
													<Power size={14} />
													{esp.estado ? "Desactivar" : "Activar"}
												</button>
											</div>
										</td>
									</>
								)}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{modal && (
				<EspecialidadModal
					inicial={modal === "nueva" ? null : modal}
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
