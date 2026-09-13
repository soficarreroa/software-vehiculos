import {
  ReportStatus,
  STATUS_MAP,
  ERROR_MESSAGES,
} from "./History.constants";
import { authenticatedFetch, readApiError } from "@/app/lib/api/client";

export interface ReportBackendDTO {
  id: number;
  fecha: string;
  descripcion_siniestro: string;
  vehiculo_nombre: string;
  placa: string;
  valor_total: number;
  estado: string;
}

export interface Report {
  id: number;
  vehicle: string;
  plate: string;
  date: Date;
  damage: string;
  value: number;
  status: ReportStatus;
}

export const historyService = {
  async getHistorial(placa?: string): Promise<Report[]> {
    const query = placa ? `?placa=${encodeURIComponent(placa)}` : "";
    const response = await authenticatedFetch(`/api/v1/historial/${query}`);
    if (!response.ok) {
      throw await readApiError(response, ERROR_MESSAGES.LOAD_ERROR);
    }

    const rawData: ReportBackendDTO[] = await response.json();
    return rawData.map((dto) => this.mapDTOToReport(dto));
  },

  async downloadReportPdf(cotizacionId: number): Promise<void> {
  const response = await authenticatedFetch(
    `/api/v1/historial/${cotizacionId}/descargar-pdf`,
  );

  if (!response.ok) {
    throw await readApiError(response, "Error al descargar el archivo PDF.");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  
  // Nombre fijo para la descarga
  link.download = "Reporte_Autoperito.pdf";

  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  },

  mapDTOToReport(dto: ReportBackendDTO): Report {
    return {
      id: dto.id,
      vehicle: dto.vehiculo_nombre || ERROR_MESSAGES.UNKNOWN_VEHICLE,
      plate: dto.placa || ERROR_MESSAGES.DEFAULT_PLATE,
      date: new Date(dto.fecha),
      damage: dto.descripcion_siniestro || ERROR_MESSAGES.NO_DESCRIPTION,
      value: dto.valor_total || 0,
      status: STATUS_MAP[dto.estado] || ReportStatus.WAITING,
    };
  },
};