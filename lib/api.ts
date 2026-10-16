const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export type ApiFn = <T>(path: string, options?: RequestInit) => Promise<T>;

export class ApiError extends Error {
	status: number;

	constructor(status: number, message: string) {
		super(message);
		this.name = "ApiError";
		this.status = status;
	}
}

async function leerMensaje(res: Response, porDefecto: string): Promise<string> {
	const body = await res.json().catch(() => null);
	return body && typeof body.mensaje === "string" ? body.mensaje : porDefecto;
}

export async function apiFetch<T>(
	path: string,
	token: string | null,
	options: RequestInit = {},
): Promise<T> {
	const headers = new Headers(options.headers);
	headers.set("Content-Type", "application/json");
	if (token) headers.set("Authorization", `Bearer ${token}`);

	const res = await fetch(`${API_URL}${path}`, { ...options, headers });

	if (res.status === 401 && token) {
		throw new ApiError(401, "Tu sesión expiró. Inicia sesión nuevamente.");
	}
	if (res.status === 403) {
		throw new ApiError(403, "No tienes permisos para realizar esta acción.");
	}
	if (!res.ok) {
		throw new ApiError(
			res.status,
			await leerMensaje(res, `Error ${res.status}`),
		);
	}
	if (res.status === 204) {
		return undefined as T;
	}

	return res.json();
}

export function mensajeDeError(e: unknown): string {
	if (e instanceof ApiError) return e.message;
	if (e instanceof TypeError) {
		return "No se pudo conectar con el servidor. ¿Está encendido el backend?";
	}
	return "Ocurrió un error inesperado.";
}
