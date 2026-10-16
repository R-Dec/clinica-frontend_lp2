"use client";

import { type SubmitEvent, useState } from "react";
import Alerta from "@/components/ui/Alerta";
import Modal from "@/components/ui/Modal";
import type { Especialidad } from "@/features/especialidades/types";
import { mensajeDeError } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import {
	CARGO_MEDICO,
	CARGO_RECEPCIONISTA,
	etiquetaCargo,
	TURNOS,
} from "./constantes";
import { guardarEmpleado } from "./service";
import type { Cargo, Empleado, EmpleadoRequest } from "./types";

interface Props {
	inicial: Empleado | null;
	cargos: Cargo[];
	especialidades: Especialidad[];
	onClose: () => void;
	onGuardado: () => void;
}

const CLASE_CAMPO =
	"w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-600 focus:outline-none";
const CLASE_LABEL = "mb-1 block text-sm font-medium text-slate-700";

export default function EmpleadoModal({
	inicial,
	cargos,
	especialidades,
	onClose,
	onGuardado,
}: Props) {
	const api = useApi();
	const [idCargo, setIdCargo] = useState(
		inicial ? String(inicial.idCargo) : "",
	);
	const [idEspecialidad, setIdEspecialidad] = useState(
		inicial?.idEspecialidad ? String(inicial.idEspecialidad) : "",
	);
	const [turno, setTurno] = useState(inicial?.turno ?? "");
	const [nombre, setNombre] = useState(inicial?.nombre ?? "");
	const [apellido, setApellido] = useState(inicial?.apellido ?? "");
	const [dni, setDni] = useState(inicial?.dni ?? "");
	const [telefono, setTelefono] = useState(inicial?.telefono ?? "");
	const [error, setError] = useState("");
	const [enviando, setEnviando] = useState(false);

	const nombreCargo = cargos.find(
		(c) => String(c.idCargo) === idCargo,
	)?.nombreCargo;
	const esMedico = nombreCargo === CARGO_MEDICO;
	const llevaTurno = esMedico || nombreCargo === CARGO_RECEPCIONISTA;

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		setError("");
		setEnviando(true);

		const datos: EmpleadoRequest = {
			idCargo: Number(idCargo),
			idEspecialidad: esMedico ? Number(idEspecialidad) : null,
			nombre: nombre.trim(),
			apellido: apellido.trim(),
			dni: dni.trim(),
			telefono: telefono.trim() || null,
			turno: llevaTurno ? turno : null,
		};

		try {
			await guardarEmpleado(api, inicial?.idEmpleado ?? null, datos);
			onGuardado();
		} catch (err) {
			setError(mensajeDeError(err));
		} finally {
			setEnviando(false);
		}
	}

	return (
		<Modal
			titulo={inicial ? "Editar empleado" : "Nuevo empleado"}
			onClose={onClose}
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label htmlFor="emp-cargo" className={CLASE_LABEL}>
						Cargo
					</label>
					<select
						id="emp-cargo"
						required
						value={idCargo}
						onChange={(e) => setIdCargo(e.target.value)}
						className={CLASE_CAMPO}
					>
						<option value="">Selecciona un cargo</option>
						{cargos.map((c) => (
							<option key={c.idCargo} value={c.idCargo}>
								{etiquetaCargo(c.nombreCargo)}
							</option>
						))}
					</select>
				</div>

				{esMedico && (
					<div>
						<label htmlFor="emp-esp" className={CLASE_LABEL}>
							Especialidad
						</label>
						<select
							id="emp-esp"
							required
							value={idEspecialidad}
							onChange={(e) => setIdEspecialidad(e.target.value)}
							className={CLASE_CAMPO}
						>
							<option value="">Selecciona una especialidad</option>
							{especialidades.map((esp) => (
								<option key={esp.idEspecialidad} value={esp.idEspecialidad}>
									{esp.nombre}
								</option>
							))}
						</select>
					</div>
				)}

				{llevaTurno && (
					<div>
						<label htmlFor="emp-turno" className={CLASE_LABEL}>
							Turno
						</label>
						<select
							id="emp-turno"
							required
							value={turno}
							onChange={(e) => setTurno(e.target.value)}
							className={CLASE_CAMPO}
						>
							<option value="">Selecciona un turno</option>
							{TURNOS.map((t) => (
								<option key={t.valor} value={t.valor}>
									{t.etiqueta} ({t.horario})
								</option>
							))}
						</select>
					</div>
				)}

				<div className="grid gap-4 sm:grid-cols-2">
					<div>
						<label htmlFor="emp-nombre" className={CLASE_LABEL}>
							Nombre
						</label>
						<input
							id="emp-nombre"
							required
							maxLength={50}
							value={nombre}
							onChange={(e) => setNombre(e.target.value)}
							className={CLASE_CAMPO}
						/>
					</div>
					<div>
						<label htmlFor="emp-apellido" className={CLASE_LABEL}>
							Apellido
						</label>
						<input
							id="emp-apellido"
							required
							maxLength={80}
							value={apellido}
							onChange={(e) => setApellido(e.target.value)}
							className={CLASE_CAMPO}
						/>
					</div>
					<div>
						<label htmlFor="emp-dni" className={CLASE_LABEL}>
							DNI
						</label>
						<input
							id="emp-dni"
							required
							inputMode="numeric"
							pattern="\d{8}"
							title="El DNI debe tener 8 dígitos"
							maxLength={8}
							value={dni}
							onChange={(e) => setDni(e.target.value)}
							className={CLASE_CAMPO}
						/>
					</div>
					<div>
						<label htmlFor="emp-telefono" className={CLASE_LABEL}>
							Teléfono (opcional)
						</label>
						<input
							id="emp-telefono"
							maxLength={20}
							value={telefono}
							onChange={(e) => setTelefono(e.target.value)}
							className={CLASE_CAMPO}
						/>
					</div>
				</div>

				<Alerta mensaje={error} />

				<div className="flex justify-end gap-2">
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
					>
						Cancelar
					</button>
					<button
						type="submit"
						disabled={enviando}
						className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-50"
					>
						{enviando ? "Guardando..." : "Guardar"}
					</button>
				</div>
			</form>
		</Modal>
	);
}
