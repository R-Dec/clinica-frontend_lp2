import { apiFetch } from "@/lib/api";
import type { LoginRequest, LoginResponse } from "./types";

export function iniciarSesion(datos: LoginRequest) {
  return apiFetch<LoginResponse>("/usuarios/login", null, {
    method: "POST",
    body: JSON.stringify(datos),
  });
}
