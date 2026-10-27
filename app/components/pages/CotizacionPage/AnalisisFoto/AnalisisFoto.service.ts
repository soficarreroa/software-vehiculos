import { authenticatedFetch, readApiError } from "@/app/lib/api/client";
import { ERROR_MESSAGES } from "./AnalisisFoto.constants";

export interface DanoDetectado {
  tipo_dano: string;
  clase_yolo: string;
  confianza: number;
  area_relativa: number;
  severidad: string | null;
  etiqueta_costo: string | null;
}

export interface ResultadoAnalisis {
  imagen: string;
  mensaje: string | null;
  tipos_detectados: string[];
  danos_detectados: DanoDetectado[];
}

export const analisisService = {
  async analizarFoto(foto: File): Promise<ResultadoAnalisis> {
    const formData = new FormData();
    formData.append("imagen", foto);

    const response = await authenticatedFetch("/api/v1/analisis/danos", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw await readApiError(response, ERROR_MESSAGES.ANALISIS_ERROR);
    }
    return response.json();
  },
};
