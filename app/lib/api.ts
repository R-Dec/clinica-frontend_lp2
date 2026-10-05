import { LoginRequest, LoginResponse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

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

export async function loginRequest(data: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/usuarios/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(await leerMensaje(res, "No se pudo iniciar sesión"));
  }

  return res.json();
}

export async function apiFetch<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });

  if (res.status === 401) {
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
