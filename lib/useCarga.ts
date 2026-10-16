"use client";

import { useCallback, useEffect, useState } from "react";
import { mensajeDeError } from "./api";

export function useCarga<T>(cargar: () => Promise<T>) {
	const [datos, setDatos] = useState<T | null>(null);
	const [error, setError] = useState("");

	useEffect(() => {
		let cancelado = false;
		cargar()
			.then((resultado) => {
				if (cancelado) return;
				setDatos(resultado);
				setError("");
			})
			.catch((e) => {
				if (!cancelado) setError(mensajeDeError(e));
			});
		return () => {
			cancelado = true;
		};
	}, [cargar]);

	const recargar = useCallback(async () => {
		try {
			setDatos(await cargar());
			setError("");
		} catch (e) {
			setError(mensajeDeError(e));
		}
	}, [cargar]);

	return {
		datos,
		error,
		cargando: datos === null && error === "",
		recargar,
		setError,
	};
}
