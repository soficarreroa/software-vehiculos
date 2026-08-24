import {
  ReportStatus,
  STATUS_MAP,
  ERROR_MESSAGES,
} from "./History.constants";

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const historyService = {
  async getHistorial(userId: string): Promise<Report[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/historial?user_id=${userId}`);
    
    // Si la respuesta falla, lee el texto HTML/mensaje en lugar de forzar .json()
    if (!response.ok) {
      const errorHtml = await response.text();
      console.error(`[${response.status}] Error del backend:`, errorHtml);
      throw new Error(`[${response.status}] ${ERROR_MESSAGES.LOAD_ERROR}`);
    }

    const rawData: ReportBackendDTO[] = await response.json();
    return rawData.map((dto) => this.mapDTOToReport(dto));
  },

  async downloadReportPdf(cotizacionId: number, userId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/historial/${cotizacionId}/descargar-pdf?user_id=${userId}`
  );

  if (!response.ok) {
    const errorHtml = await response.text();
    console.error("Error al descargar PDF:", errorHtml);
    throw new Error("Error al descargar el archivo PDF.");
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