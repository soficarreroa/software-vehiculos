import { authenticatedFetch, readApiError } from "@/app/lib/api/client";

export interface Vehicle {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  color: string;
  creado_en?: string;
}

let vehiclesCache: { token: string; vehicles: Vehicle[] } | null = null;

export async function getAuthenticatedVehicles(): Promise<Vehicle[]> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  if (token && vehiclesCache?.token === token) {
    return vehiclesCache.vehicles;
  }

  const response = await authenticatedFetch("/api/v1/vehiculos");
  if (!response.ok) {
    throw await readApiError(response, "No se pudieron cargar tus vehículos.");
  }

  const data: unknown = await response.json();
  const vehicles = Array.isArray(data) ? (data as Vehicle[]) : [];
  if (token) {
    vehiclesCache = { token, vehicles };
  }
  return vehicles;
}

export function invalidateVehiclesCache() {
  vehiclesCache = null;
}
