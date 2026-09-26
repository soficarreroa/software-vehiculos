import { authenticatedFetch, readApiError } from "@/app/lib/api/client";
import { ERROR_MESSAGES } from "./AdminDashboard.constants";

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

export interface PiezaAdmin {
  id: number;
  codigo: string | null;
  nombre: string;
  zona: string | null;
  descripcion: string | null;
}

export interface CatalogoPrecioAdmin {
  id: number;
  pieza_id: number;
  pieza_nombre: string;
  marca: string;
  modelo: string;
  ano_desde: number;
  ano_hasta: number;
  precio_repuesto: number;
  precio_mano_obra: number | null;
  precio_pintura: number | null;
  moneda: string;
}

export interface NuevoCatalogoPrecio {
  pieza_id: number;
  marca: string;
  modelo: string;
  ano_desde: number;
  ano_hasta: number;
  precio_repuesto: number;
  precio_mano_obra: number | null;
  precio_pintura: number | null;
  moneda: string;
}

async function manejarRespuesta<T>(
  response: Response,
  mensajeError: string = ERROR_MESSAGES.LOAD_ERROR
): Promise<T> {
  if (!response.ok) {
    throw await readApiError(response, mensajeError);
  }
  return response.json();
}

export const adminService = {
  async getResumen(): Promise<ResumenAdmin> {
    const response = await authenticatedFetch("/api/v1/admin/resumen");
    return manejarRespuesta<ResumenAdmin>(response);
  },

  async getTalleres(): Promise<TallerAdmin[]> {
    const response = await authenticatedFetch("/api/v1/admin/talleres");
    return manejarRespuesta<TallerAdmin[]>(response);
  },

  async verificarTaller(tallerId: number, verificado: boolean): Promise<TallerAdmin> {
    const response = await authenticatedFetch(
      `/api/v1/admin/talleres/${tallerId}/verificar?verificado=${verificado}`,
      { method: "PATCH" }
    );
    return manejarRespuesta<TallerAdmin>(response, ERROR_MESSAGES.ACTION_ERROR);
  },

  async getUsuarios(): Promise<UsuarioAdmin[]> {
    const response = await authenticatedFetch("/api/v1/admin/usuarios");
    return manejarRespuesta<UsuarioAdmin[]>(response);
  },

  async cambiarRolUsuario(usuarioId: number, rol: string): Promise<UsuarioAdmin> {
    const response = await authenticatedFetch(`/api/v1/admin/usuarios/${usuarioId}/rol`, {
      method: "PATCH",
      body: JSON.stringify({ rol }),
    });
    return manejarRespuesta<UsuarioAdmin>(response, ERROR_MESSAGES.ACTION_ERROR);
  },

  async cambiarEstadoUsuario(usuarioId: number, activo: boolean): Promise<UsuarioAdmin> {
    const response = await authenticatedFetch(`/api/v1/admin/usuarios/${usuarioId}/estado`, {
      method: "PATCH",
      body: JSON.stringify({ activo }),
    });
    return manejarRespuesta<UsuarioAdmin>(response, ERROR_MESSAGES.ACTION_ERROR);
  },

  async getPiezas(): Promise<PiezaAdmin[]> {
    const response = await authenticatedFetch("/api/v1/admin/piezas");
    return manejarRespuesta<PiezaAdmin[]>(response);
  },

  async getCatalogoPrecios(): Promise<CatalogoPrecioAdmin[]> {
    const response = await authenticatedFetch("/api/v1/admin/catalogo-precios");
    return manejarRespuesta<CatalogoPrecioAdmin[]>(response);
  },

  async crearPrecioCatalogo(payload: NuevoCatalogoPrecio): Promise<CatalogoPrecioAdmin> {
    const response = await authenticatedFetch("/api/v1/admin/catalogo-precios", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return manejarRespuesta<CatalogoPrecioAdmin>(response, ERROR_MESSAGES.ACTION_ERROR);
  },

  async eliminarPrecioCatalogo(precioId: number): Promise<void> {
    const response = await authenticatedFetch(`/api/v1/admin/catalogo-precios/${precioId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw await readApiError(response, ERROR_MESSAGES.ACTION_ERROR);
  },
};