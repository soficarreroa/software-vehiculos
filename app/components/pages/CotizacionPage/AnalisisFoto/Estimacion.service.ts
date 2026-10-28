import { authenticatedFetch, readApiError } from "@/app/lib/api/client";
import type { Establecimiento } from "./AnalisisFoto.constants";

export interface RangoPrecio {
  minimo_cop: number;
  maximo_cop: number;
}

export interface TotalEstablecimiento {
  minimo_cop: number | null;
  maximo_cop: number | null;
  completo: boolean;
  piezas_no_estimadas: string[];
}

export interface DesglosePieza {
  pieza: string;
  severidad: string;
  precios: Record<Establecimiento, RangoPrecio | null>;
  danos: { indice_dano: number; tipo_dano: string | null }[];
}

export interface DanoNoEstimado {
  indice_dano: number;
  tipo_dano: string | null;
  motivo: string;
}

export interface Estimacion {
  moneda: string;
  desglose: DesglosePieza[];
  totales: Record<Establecimiento, TotalEstablecimiento>;
  danos_no_estimados: DanoNoEstimado[];
  advertencias: string[];
  nota: string;
}

export interface DanoParaEstimar {
  tipo_dano: string;
  severidad: string | null;
  confianza: number;
}

export interface AsignacionPieza {
  indice_dano: number;
  pieza: string;
}

export const estimacionService = {
  async estimar(
    vehiculoId: number,
    danos: DanoParaEstimar[],
    asignaciones: AsignacionPieza[],
  ): Promise<Estimacion> {
    const response = await authenticatedFetch("/api/v1/cotizaciones/estimar", {
      method: "POST",
      body: JSON.stringify({ vehiculo_id: vehiculoId, danos, asignaciones }),
    });
    if (!response.ok) {
      throw await readApiError(response, "No se pudo calcular el costo estimado.");
    }
    return response.json();
  },
};
