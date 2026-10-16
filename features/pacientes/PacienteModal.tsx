"use client";

import { type SubmitEvent, useState } from "react";
import Alerta from "@/components/ui/Alerta";
import Modal from "@/components/ui/Modal";
import { mensajeDeError } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { guardarPaciente } from "./service";
import type { Paciente } from "./types";

interface Props {
	inicial: Paciente | null;
	dniInicial?: string;
	onClose: () => void;
	onGuardado: (paciente: Paciente) => void;
}

const CLASE_CAMPO =
	"w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-600 focus:outline-none";
const CLASE_LABEL = "mb-1 block text-sm font-medium text-slate-700";

export default function PacienteModal({
	inicial,
	dniInicial = "",
	onClose,
	onGuardado,
}: Props) {
	const api = useApi();
	const [nombre, setNombre] = useState(inicial?.nombre ?? "");
	const [apellido, setApellido] = useState(inicial?.apellido ?? "");
	const [dni, setDni] = useState(inicial?.dni ?? dniInicial);
	const [telefono, setTelefono] = useState(inicial?.telefono ?? "");
	const [error, setError] = useState("");
	const [enviando, setEnviando] = useState(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		setError("");
		setEnviando(true);
		try {
			const guardado = await guardarPaciente(api, inicial?.idPaciente ?? null, {
				nombre: nombre.trim(),
				apellido: apellido.trim(),
				dni: dni.trim(),
				telefono: telefono.trim() || null,
			});
			onGuardado(guardado);
		} catch (err) {
			setError(mensajeDeError(err));
		} finally {
			setEnviando(false);
		}
	}

	return (
		<Modal
			titulo={inicial ? "Editar paciente" : "Nuevo paciente"}
			onClose={onClose}
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="grid gap-4 sm:grid-cols-2">
					<div>
						<label htmlFor="pac-nombre" className={CLASE_LABEL}>
							Nombre
						</label>
						<input
							id="pac-nombre"
							required
							maxLength={50}
							value={nombre}
							onChange={(e) => setNombre(e.target.value)}
							className={CLASE_CAMPO}
						/>
					</div>
					<div>
						<label htmlFor="pac-apellido" className={CLASE_LABEL}>
							Apellido
						</label>
						<input
							id="pac-apellido"
							required
							maxLength={80}
							value={apellido}
							onChange={(e) => setApellido(e.target.value)}
							className={CLASE_CAMPO}
						/>
					</div>
					<div>
						<label htmlFor="pac-dni" className={CLASE_LABEL}>
							DNI
						</label>
						<input
							id="pac-dni"
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
						<label htmlFor="pac-tel" className={CLASE_LABEL}>
							Teléfono (opcional)
						</label>
						<input
							id="pac-tel"
							type="tel"
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
