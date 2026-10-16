"use client";

import { type SubmitEvent, useState } from "react";
import Alerta from "@/components/ui/Alerta";
import Modal from "@/components/ui/Modal";
import type { Empleado } from "@/features/empleados/types";
import { mensajeDeError } from "@/lib/api";
import { etiquetaRol } from "@/lib/navigation";
import { useApi } from "@/lib/useApi";
import { actualizarUsuario, crearUsuario } from "./service";
import type { Rol, Usuario } from "./types";

interface Props {
	inicial: Usuario | null;
	empleados: Empleado[];
	roles: Rol[];
	onClose: () => void;
	onGuardado: () => void;
}

const CLASE_CAMPO =
	"w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-600 focus:outline-none";
const CLASE_LABEL = "mb-1 block text-sm font-medium text-slate-700";

export default function UsuarioModal({
	inicial,
	empleados,
	roles,
	onClose,
	onGuardado,
}: Props) {
	const api = useApi();
	const [idEmpleado, setIdEmpleado] = useState("");
	const [idRol, setIdRol] = useState(
		inicial
			? String(roles.find((r) => r.nombreRol === inicial.rol)?.idRol ?? "")
			: "",
	);
	const [correo, setCorreo] = useState(inicial?.correo ?? "");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [enviando, setEnviando] = useState(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		setError("");
		setEnviando(true);
		try {
			if (inicial) {
				await actualizarUsuario(api, inicial.idUsuario, {
					idRol: Number(idRol),
					correo: correo.trim(),
				});
			} else {
				await crearUsuario(api, {
					idEmpleado: Number(idEmpleado),
					idRol: Number(idRol),
					correo: correo.trim(),
					password,
				});
			}
			onGuardado();
		} catch (err) {
			setError(mensajeDeError(err));
		} finally {
			setEnviando(false);
		}
	}

	return (
		<Modal
			titulo={inicial ? "Editar usuario" : "Nuevo usuario"}
			onClose={onClose}
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				{inicial ? (
					<p className="text-sm text-slate-600">
						Empleado: <strong>{inicial.nombreEmpleado}</strong>
					</p>
				) : (
					<div>
						<label htmlFor="usr-emp" className={CLASE_LABEL}>
							Empleado
						</label>
						<select
							id="usr-emp"
							required
							value={idEmpleado}
							onChange={(e) => setIdEmpleado(e.target.value)}
							className={CLASE_CAMPO}
						>
							<option value="">Selecciona un empleado</option>
							{empleados.map((emp) => (
								<option key={emp.idEmpleado} value={emp.idEmpleado}>
									{emp.nombre} {emp.apellido} (DNI {emp.dni})
								</option>
							))}
						</select>
					</div>
				)}

				<div>
					<label htmlFor="usr-rol" className={CLASE_LABEL}>
						Rol
					</label>
					<select
						id="usr-rol"
						required
						value={idRol}
						onChange={(e) => setIdRol(e.target.value)}
						className={CLASE_CAMPO}
					>
						<option value="">Selecciona un rol</option>
						{roles.map((r) => (
							<option key={r.idRol} value={r.idRol}>
								{etiquetaRol(r.nombreRol)}
							</option>
						))}
					</select>
				</div>

				<div>
					<label htmlFor="usr-correo" className={CLASE_LABEL}>
						Correo
					</label>
					<input
						id="usr-correo"
						type="email"
						required
						value={correo}
						onChange={(e) => setCorreo(e.target.value)}
						className={CLASE_CAMPO}
					/>
				</div>

				{!inicial && (
					<div>
						<label htmlFor="usr-pass" className={CLASE_LABEL}>
							Contraseña (mínimo 8 caracteres)
						</label>
						<input
							id="usr-pass"
							type="password"
							required
							minLength={8}
							autoComplete="new-password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className={CLASE_CAMPO}
						/>
					</div>
				)}

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
