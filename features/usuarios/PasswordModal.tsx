"use client";

import { type SubmitEvent, useState } from "react";
import Alerta from "@/components/ui/Alerta";
import Modal from "@/components/ui/Modal";
import { mensajeDeError } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { cambiarPassword } from "./service";
import type { Usuario } from "./types";

interface Props {
	usuario: Usuario;
	onClose: () => void;
	onGuardado: () => void;
}

const CLASE_CAMPO =
	"w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-600 focus:outline-none";

export default function PasswordModal({ usuario, onClose, onGuardado }: Props) {
	const api = useApi();
	const [password, setPassword] = useState("");
	const [repetida, setRepetida] = useState("");
	const [error, setError] = useState("");
	const [enviando, setEnviando] = useState(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (password !== repetida) {
			setError("Las contraseñas no coinciden.");
			return;
		}
		setError("");
		setEnviando(true);
		try {
			await cambiarPassword(api, usuario.idUsuario, password);
			onGuardado();
		} catch (err) {
			setError(mensajeDeError(err));
		} finally {
			setEnviando(false);
		}
	}

	return (
		<Modal titulo="Restablecer contraseña" onClose={onClose}>
			<form onSubmit={handleSubmit} className="space-y-4">
				<p className="text-sm text-slate-600">
					Nueva contraseña para <strong>{usuario.correo}</strong>.
				</p>
				<div>
					<label
						htmlFor="pw-nueva"
						className="mb-1 block text-sm font-medium text-slate-700"
					>
						Nueva contraseña (mínimo 8 caracteres)
					</label>
					<input
						id="pw-nueva"
						type="password"
						required
						minLength={8}
						autoComplete="new-password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className={CLASE_CAMPO}
					/>
				</div>
				<div>
					<label
						htmlFor="pw-repetir"
						className="mb-1 block text-sm font-medium text-slate-700"
					>
						Repetir contraseña
					</label>
					<input
						id="pw-repetir"
						type="password"
						required
						autoComplete="new-password"
						value={repetida}
						onChange={(e) => setRepetida(e.target.value)}
						className={CLASE_CAMPO}
					/>
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
						{enviando ? "Guardando..." : "Actualizar"}
					</button>
				</div>
			</form>
		</Modal>
	);
}
