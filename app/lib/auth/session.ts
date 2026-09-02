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

export function sesionVencida(): boolean {
  const expiraEn = localStorage.getItem("expira_en");
  if (!expiraEn) return true;
  return Date.now() > Number(expiraEn);
}

export function rutaPorRol(rol: string): string {
  switch (rol) {
    case "cliente":
      return "/mis-vehiculos";
    case "taller":
      return "/talleres-aliados";
    case "admin":
      return "/";
    default:
      return "/no-autorizado";
  }
}