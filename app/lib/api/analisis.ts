import { ApiError, authenticatedFetch, readApiError } from "@/app/lib/api/client";
import type {
  AnalisisDanosResponse,
  ErrorResultado,
  EstimacionRequest,
  EstimacionResponse,
} from "@/app/types/cotizacionResultado";

/** Envía la foto al modelo YOLO y devuelve los daños detectados. */
export async function analizarDanos(foto: File): Promise<AnalisisDanosResponse> {
  const formData = new FormData();
  formData.append("imagen", foto);

  const response = await authenticatedFetch("/api/v1/analisis/danos", {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw await readApiError(response, "No se pudo analizar la foto.");
  }
  return (await response.json()) as AnalisisDanosResponse;
}

/** Calcula los rangos de reparación (COP) por tipo de establecimiento. */
export async function estimarCotizacion(
  datos: EstimacionRequest,
): Promise<EstimacionResponse> {
  const response = await authenticatedFetch("/api/v1/cotizaciones/estimar", {
    method: "POST",
    body: JSON.stringify(datos),
  });
  if (!response.ok) {
    throw await readApiError(response, "No se pudo calcular el estimado.");
  }
  return (await response.json()) as EstimacionResponse;
}

/** Traduce cualquier fallo de red/API a un error claro para la pantalla. */
export function clasificarError(error: unknown): ErrorResultado {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
      case 415:
        return { tipo: "formato", mensaje: error.message };
      case 413:
        return { tipo: "demasiado_grande", mensaje: error.message };
      case 422:
        return { tipo: "foto_poco_clara", mensaje: error.message };
      case 503:
      case 500:
        return { tipo: "servicio", mensaje: error.message };
      default:
        return { tipo: "desconocido", mensaje: error.message };
    }
  }
  if (error instanceof TypeError) {
    return {
      tipo: "red",
      mensaje: "No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.",
    };
  }
  return {
    tipo: "desconocido",
    mensaje: error instanceof Error ? error.message : "Ocurrió un error inesperado.",
  };
}
