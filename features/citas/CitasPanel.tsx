"use client";

import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import Alerta from "@/components/ui/Alerta";
import { listarEspecialidades } from "@/features/especialidades/service";
import { esFuturo, formatoFecha, formatoHora } from "@/lib/fechas";
import { useApi } from "@/lib/useApi";
import { useCarga } from "@/lib/useCarga";
import CitaEstadoModal from "./CitaEstadoModal";
import {
	ESTADO_ATENDIDA,
	ESTADO_CANCELADA,
	ESTADO_NO_ASISTIO,
	ESTADO_PENDIENTE,
	ESTADOS_CITA,
	estiloEstado,
	etiquetaEstado,
} from "./constantes";
import ReprogramarModal from "./ReprogramarModal";
import { listarCitas } from "./service";
import type { Cita } from "./types";

type Accion =
	| { tipo: "reprogramar"; cita: Cita }
	| { tipo: "estado"; cita: Cita; estado: string };

const BOTON =
	"text-sky-700 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline";

export default function CitasPanel() {
	const api = useApi();
	const [busqueda, setBusqueda] = useState("");
	const [estado, setEstado] = useState("");
	const [fecha, setFecha] = useState("");
	const [accion, setAccion] = useState<Accion | null>(null);

	const cargarCitas = useCallback(() => listarCitas(api), [api]);
	const cargarEspecialidades = useCallback(
		() => listarEspecialidades(api, true),
		[api],
	);
	const citas = useCarga(cargarCitas);
	const especialidades = useCarga(cargarEspecialidades);

	const texto = busqueda.trim().toLowerCase();
	const visibles = citas.datos
		?.filter((c) => {
			const coincide =
				`${c.nombrePaciente} ${c.apellidoPaciente} ${c.dniPaciente} ${c.nombreMedico} ${c.apellidoMedico} ${c.nombreEspecialidad}`
					.toLowerCase()
					.includes(texto);
			return (
				coincide &&
				(estado === "" || c.estado === estado) &&
				(fecha === "" || c.fechaHoraCita.startsWith(fecha))
			);
		})
		.sort((a, b) => b.fechaHoraCita.localeCompare(a.fechaHoraCita));

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex flex-wrap items-center gap-2">
					<div className="relative">
						<Search
							size={16}
							className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
						/>
						<input
							type="search"
							aria-label="Buscar cita"
							placeholder="Paciente, DNI, médico..."
							value={busqueda}
							onChange={(e) => setBusqueda(e.target.value)}
							className="w-64 rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-sky-600 focus:outline-none"
						/>
					</div>
					<select
						aria-label="Filtrar por estado"
						value={estado}
						onChange={(e) => setEstado(e.target.value)}
						className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-600 focus:outline-none"
					>
						<option value="">Todos los estados</option>
						{ESTADOS_CITA.map((e) => (
							<option key={e} value={e}>
								{etiquetaEstado(e)}
							</option>
						))}
					</select>
					<input
						type="date"
						aria-label="Filtrar por fecha"
						value={fecha}
						onChange={(e) => setFecha(e.target.value)}
						className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-600 focus:outline-none"
					/>
					{fecha && (
						<button
							type="button"
							onClick={() => setFecha("")}
							className="text-sm text-sky-700 hover:underline"
						>
							Quitar fecha
						</button>
					)}
				</div>
				<Link
					href="/agendar-cita"
					className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800"
				>
					<Plus size={16} />
					Nueva cita
				</Link>
			</div>

			<Alerta mensaje={citas.error || especialidades.error} />

			<div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
				<table className="w-full text-left text-sm">
					<thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
						<tr>
							<th className="px-4 py-3">Fecha</th>
							<th className="px-4 py-3">Hora</th>
							<th className="px-4 py-3">Paciente</th>
							<th className="px-4 py-3">Médico</th>
							<th className="px-4 py-3">Especialidad</th>
							<th className="px-4 py-3">Estado</th>
							<th className="px-4 py-3">Registró</th>
							<th className="px-4 py-3">Acciones</th>
						</tr>
					</thead>
					<tbody>
						{citas.cargando && (
							<tr>
								<td
									colSpan={8}
									className="px-4 py-6 text-center text-slate-500"
								>
									Cargando...
								</td>
							</tr>
						)}
						{visibles?.length === 0 && (
							<tr>
								<td
									colSpan={8}
									className="px-4 py-6 text-center text-slate-500"
								>
									No se encontraron citas.
								</td>
							</tr>
						)}
						{visibles?.map((c) => {
							const pendiente = c.estado === ESTADO_PENDIENTE;
							const futura = esFuturo(c.fechaHoraCita);
							return (
								<tr
									key={c.idCita}
									className="border-b border-slate-100 last:border-0"
								>
									<td className="px-4 py-3">{formatoFecha(c.fechaHoraCita)}</td>
									<td className="px-4 py-3">{formatoHora(c.fechaHoraCita)}</td>
									<td className="px-4 py-3">
										<p className="font-medium">
											{c.nombrePaciente} {c.apellidoPaciente}
										</p>
										<p className="text-xs text-slate-500">
											DNI {c.dniPaciente}
										</p>
									</td>
									<td className="px-4 py-3">
										{c.nombreMedico} {c.apellidoMedico}
									</td>
									<td className="px-4 py-3 text-slate-600">
										{c.nombreEspecialidad}
									</td>
									<td className="px-4 py-3">
										<span
											className={`rounded-full px-2.5 py-1 text-xs font-medium ${estiloEstado(c.estado)}`}
										>
											{etiquetaEstado(c.estado)}
										</span>
									</td>
									<td className="px-4 py-3 text-slate-600">
										{c.nombreUsuarioRegistro} {c.apellidoUsuarioRegistro}
									</td>
									<td className="px-4 py-3">
										{pendiente ? (
											<div className="flex flex-wrap gap-x-3 gap-y-1">
												<button
													type="button"
													disabled={!especialidades.datos}
													onClick={() =>
														setAccion({ tipo: "reprogramar", cita: c })
													}
													className={BOTON}
												>
													Reprogramar
												</button>
												<button
													type="button"
													disabled={futura}
													title={
														futura
															? "Disponible cuando llegue la hora de la cita"
															: undefined
													}
													onClick={() =>
														setAccion({
															tipo: "estado",
															cita: c,
															estado: ESTADO_ATENDIDA,
														})
													}
													className={BOTON}
												>
													Atendida
												</button>
												<button
													type="button"
													disabled={futura}
													title={
														futura
															? "Disponible cuando llegue la hora de la cita"
															: undefined
													}
													onClick={() =>
														setAccion({
															tipo: "estado",
															cita: c,
															estado: ESTADO_NO_ASISTIO,
														})
													}
													className={BOTON}
												>
													No asistió
												</button>
												<button
													type="button"
													onClick={() =>
														setAccion({
															tipo: "estado",
															cita: c,
															estado: ESTADO_CANCELADA,
														})
													}
													className="text-red-600 hover:underline"
												>
													Cancelar
												</button>
											</div>
										) : (
											<span className="text-slate-400">—</span>
										)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{accion?.tipo === "reprogramar" && especialidades.datos && (
				<ReprogramarModal
					cita={accion.cita}
					especialidades={especialidades.datos}
					onClose={() => setAccion(null)}
					onGuardado={() => {
						setAccion(null);
						citas.recargar();
					}}
				/>
			)}

			{accion?.tipo === "estado" && (
				<CitaEstadoModal
					cita={accion.cita}
					estado={accion.estado}
					onClose={() => setAccion(null)}
					onGuardado={() => {
						setAccion(null);
						citas.recargar();
					}}
				/>
			)}
		</div>
	);
}
