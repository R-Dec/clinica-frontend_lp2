"use client";

import { useRouter } from "next/navigation";
import { type SubmitEvent, useEffect, useState } from "react";
import Alerta from "@/components/ui/Alerta";
import { useAuth } from "@/features/auth/AuthContext";
import { mensajeDeError } from "@/lib/api";

export default function LoginPage() {
	const { user, loading, login } = useAuth();
	const router = useRouter();
	const [correo, setCorreo] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [enviando, setEnviando] = useState(false);

	useEffect(() => {
		if (!loading && user) router.replace("/dashboard");
	}, [user, loading, router]);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		setError("");
		setEnviando(true);
		try {
			await login(correo, password);
		} catch (err) {
			setError(mensajeDeError(err));
		} finally {
			setEnviando(false);
		}
	}

	return (
		<main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
			<form
				onSubmit={handleSubmit}
				className="w-full max-w-sm space-y-4 rounded-xl bg-white p-8 shadow-md"
			>
				<h1 className="text-center text-2xl font-bold text-slate-800">
					Clínica · Iniciar sesión
				</h1>

				<div>
					<label
						htmlFor="correo"
						className="mb-1 block text-sm font-medium text-slate-700"
					>
						Correo
					</label>
					<input
						id="correo"
						type="email"
						required
						value={correo}
						onChange={(e) => setCorreo(e.target.value)}
						placeholder="admin@clinica.com"
						className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none"
					/>
				</div>

				<div>
					<label
						htmlFor="password"
						className="mb-1 block text-sm font-medium text-slate-700"
					>
						Contraseña
					</label>
					<input
						id="password"
						type="password"
						required
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none"
					/>
				</div>

				<Alerta mensaje={error} />

				<button
					type="submit"
					disabled={enviando}
					className="w-full rounded-md bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
				>
					{enviando ? "Ingresando..." : "Ingresar"}
				</button>
			</form>
		</main>
	);
}
