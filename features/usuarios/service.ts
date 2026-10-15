import type { ApiFn } from "@/lib/api";
import type { Rol, Usuario, UsuarioActualizar, UsuarioCrear } from "./types";

export function listarUsuarios(api: ApiFn) {
  return api<Usuario[]>("/usuarios");
}

export function listarRoles(api: ApiFn) {
  return api<Rol[]>("/roles");
}

export function crearUsuario(api: ApiFn, datos: UsuarioCrear) {
  return api<Usuario>("/usuarios", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export function actualizarUsuario(
  api: ApiFn,
  id: number,
  datos: UsuarioActualizar,
) {
  return api<Usuario>(`/usuarios/${id}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });
}

export function cambiarEstadoUsuario(api: ApiFn, id: number, estado: boolean) {
  return api<Usuario>(`/usuarios/${id}/estado`, {
    method: "PATCH",
    body: JSON.stringify({ estado }),
  });
}

export function cambiarPassword(api: ApiFn, id: number, password: string) {
  return api<void>(`/usuarios/${id}/password`, {
    method: "PATCH",
    body: JSON.stringify({ password }),
  });
}
