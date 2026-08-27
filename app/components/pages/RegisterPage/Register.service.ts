import type { RegisterFormValues } from "./Register.schema";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface RegisterResponse {
  message: string;
  usuario: {
    id: string;
    correo: string;
    nombre_completo: string;
    rol: string;
    auth_id: string;
    activo: boolean;
  };
}

function mapErrorMessage(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("already registered") || lower.includes("already exists")) {
    return "El correo ya está registrado";
  }
  return raw;
}

export async function registerRequest(data: RegisterFormValues): Promise<RegisterResponse> {
  const response = await fetch(`${API_URL}/auth/registro/cliente`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(mapErrorMessage(body?.detail ?? "No se pudo completar el registro. Intenta de nuevo."));
  }

  return body as RegisterResponse;
}