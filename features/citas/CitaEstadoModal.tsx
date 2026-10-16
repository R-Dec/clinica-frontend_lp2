"use client";

import { useState } from "react";
import Alerta from "@/components/ui/Alerta";
import Modal from "@/components/ui/Modal";
import { mensajeDeError } from "@/lib/api";
import { formatoFechaHora } from "@/lib/fechas";
import { useApi } from "@/lib/useApi";
import { ESTADO_CANCELADA, etiquetaEstado } from "./constantes";
import { cambiarEstadoCita } from "./service";
import type { Cita } from "./types";

interface Props {
	cita: Cita;
	estado: string;
	onClose: () => void;
	onGuardado: () => void;
}

export default function CitaEstadoModal({
	cita,
	estado,
	onClose,
	onGuardado,
}: Props) {
	const api = useApi();
	const [error, setError] = useState("");
	const [enviando, setEnviando] = useState(false);
	const esCancelar = estado === ESTADO_CANCELADA;

	async function confirmar() {
		setError("");
		setEnviando(true);
		try {
			await cambiarEstadoCita(api, cita.idCita, estado);
			onGuardado();
		} catch (err) {
			setError(mensajeDeError(err));
		} finally {
			setEnviando(false);
		}
	}

	return (
		<Modal
			titulo={`Marcar como ${etiquetaEstado(estado).toLowerCase()}`}
			onClose={onClose}
		>
			<div className="space-y-4">
				<p className="text-sm text-slate-700">
					Cita de{" "}
					<strong>
						{cita.nombrePaciente} {cita.apellidoPaciente}
					</strong>{" "}
					con {cita.nombreMedico} {cita.apellidoMedico} el{" "}
					{formatoFechaHora(cita.fechaHoraCita)}.
				</p>
				<p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
					Una vez cambiado el estado, la cita ya no se podrá modificar.
				</p>
				<Alerta mensaje={error} />
				<div className="flex justify-end gap-2">
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
					>
						Volver
					</button>
					<button
						type="button"
						disabled={enviando}
						onClick={confirmar}
						className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
							esCancelar
								? "bg-red-600 hover:bg-red-700"
								: "bg-sky-700 hover:bg-sky-800"
						}`}
					>
						{enviando ? "Guardando..." : "Confirmar"}
					</button>
				</div>
			</div>
		</Modal>
	);
}
