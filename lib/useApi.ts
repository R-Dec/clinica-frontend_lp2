"use client";

import { useCallback } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { ApiError, type ApiFn, apiFetch } from "./api";

export function useApi(): ApiFn {
	const { user, logout } = useAuth();
	const token = user?.token;

	return useCallback(
		async <T>(path: string, options: RequestInit = {}): Promise<T> => {
			if (!token) throw new ApiError(401, "Sesión no iniciada");
			try {
				return await apiFetch<T>(path, token, options);
			} catch (e) {
				if (e instanceof ApiError && e.status === 401) logout();
				throw e;
			}
		},
		[token, logout],
	);
}
