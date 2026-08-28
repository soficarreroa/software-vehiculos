export interface UsuarioSesion {
  id: string;
  correo: string;
  nombre_completo: string;
  rol: string;
  auth_id: string;
}

export function limpiarSesion() {
  localStorage.removeItem("usuario");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export function getUsuarioSesion(): UsuarioSesion | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("usuario");
  if (!raw || raw === "undefined" || raw === "null") return null;
  try {
    return JSON.parse(raw) as UsuarioSesion;
  } catch {
    limpiarSesion();
    return null;
  }
}

export function puedeGestionarTalleres(usuario: UsuarioSesion | null): boolean {
  if (!usuario) return false;
  return usuario.rol !== "cliente";
}