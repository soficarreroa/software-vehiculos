import { API_BASE_URL, ERROR_MESSAGES } from "./AdminDashboard.constants";

export interface ResumenAdmin {
  total_usuarios: number;
  usuarios_por_rol: Record<string, number>;
  usuarios_inactivos: number;
  total_talleres: number;
  talleres_pendientes: number;
  total_vehiculos: number;
  total_cotizaciones: number;
  cotizaciones_por_estado: Record<string, number>;
}

export interface TallerAdmin {
  id: number;
  nombre: string;
  propietario_id: string;
  direccion: string;
  telefono: string;
  email: string;
  categoria: string;
  verificado: boolean;
  certificado: boolean;
  creado_en: string;
}

export interface UsuarioAdmin {
  id: number;
  correo: string;
  nombre_completo: string;
  rol: string;
  activo: boolean;
  creado_en: string;
}

function authHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function manejarRespuesta<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const detalle = await response.text();
    console.error(`[${response.status}] Error del backend:`, detalle);
    throw new Error(ERROR_MESSAGES.LOAD_ERROR);
  }
  return response.json();
}

export const adminService = {
  async getResumen(): Promise<ResumenAdmin> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/resumen`, {
      headers: authHeaders(),
    });
    return manejarRespuesta<ResumenAdmin>(response);
  },

  async getTalleres(): Promise<TallerAdmin[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/talleres`, {
      headers: authHeaders(),
    });
    return manejarRespuesta<TallerAdmin[]>(response);
  },

  async verificarTaller(tallerId: number, verificado: boolean): Promise<TallerAdmin> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/admin/talleres/${tallerId}/verificar?verificado=${verificado}`,
      { method: "PATCH", headers: authHeaders() }
    );
    if (!response.ok) throw new Error(ERROR_MESSAGES.ACTION_ERROR);
    return response.json();
  },

  async getUsuarios(): Promise<UsuarioAdmin[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/usuarios`, {
      headers: authHeaders(),
    });
    return manejarRespuesta<UsuarioAdmin[]>(response);
  },

  async cambiarRolUsuario(usuarioId: number, rol: string): Promise<UsuarioAdmin> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/admin/usuarios/${usuarioId}/rol`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ rol }),
      }
    );
    if (!response.ok) throw new Error(ERROR_MESSAGES.ACTION_ERROR);
    return response.json();
  },

  async cambiarEstadoUsuario(usuarioId: number, activo: boolean): Promise<UsuarioAdmin> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/admin/usuarios/${usuarioId}/estado`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ activo }),
      }
    );
    if (!response.ok) throw new Error(ERROR_MESSAGES.ACTION_ERROR);
    return response.json();
  },
};