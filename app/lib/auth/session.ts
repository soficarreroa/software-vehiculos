import { useSyncExternalStore } from "react";

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
  localStorage.removeItem("expira_en");
  localStorage.removeItem("vehiculos");
  localStorage.removeItem("cotizaciones");
  localStorage.removeItem("historial");
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

export interface DatosSesion {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  usuario: UsuarioSesion;
}

/** Reemplaza cualquier sesión previa por la nueva en localStorage. */
export function guardarSesion(datos: DatosSesion) {
  limpiarSesion();
  localStorage.setItem("access_token", datos.access_token);
  localStorage.setItem("refresh_token", datos.refresh_token);
  localStorage.setItem("usuario", JSON.stringify(datos.usuario));
  localStorage.setItem("expira_en", String(Date.now() + datos.expires_in * 1000));
}

// ---------------------------------------------------------------------------
// Hooks para leer la sesión sin llamar setState dentro de useEffect.
// ---------------------------------------------------------------------------

let rawEnCache: string | null | undefined;
let usuarioEnCache: UsuarioSesion | null = null;

function leerUsuarioEstable(): UsuarioSesion | null {
  const raw = localStorage.getItem("usuario");
  if (raw === rawEnCache) return usuarioEnCache;
  rawEnCache = raw;
  if (!raw || raw === "undefined" || raw === "null") {
    usuarioEnCache = null;
  } else {
    try {
      usuarioEnCache = JSON.parse(raw) as UsuarioSesion;
    } catch {
      usuarioEnCache = null;
    }
  }
  return usuarioEnCache;
}

function suscribirSesion(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

/** Usuario de la sesión actual (null en el servidor y mientras no exista sesión). */
export function useUsuarioSesion(): UsuarioSesion | null {
  return useSyncExternalStore(suscribirSesion, leerUsuarioEstable, () => null);
}

const sinSuscripcion = () => () => {};

/** false durante SSR/hidratación y true una vez montado en el cliente. */
export function useMontado(): boolean {
  return useSyncExternalStore(sinSuscripcion, () => true, () => false);
}
