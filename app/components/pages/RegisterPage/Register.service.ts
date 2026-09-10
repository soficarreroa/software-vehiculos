import type { ClienteRegisterSchema, TallerRegisterSchema } from "./Register.schema";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface RegisterResponse {
  message?: string;
  [key: string]: unknown;
}

export type RegisterRequest = ClienteRegisterSchema | TallerRegisterSchema;

function mapErrorMessage(body: unknown): string {
  if (typeof body === "object" && body !== null && "detail" in body) {
    const detail = (body as { detail?: unknown }).detail;

    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          if (typeof item === "object" && item !== null && "msg" in item) {
            return String((item as { msg: unknown }).msg);
          }
          return String(item);
        })
        .join(". ");
    }

    if (typeof detail === "string") {
      const lower = detail.toLowerCase();
      if (lower.includes("already registered") || lower.includes("already exists")) {
        return "El correo ya está registrado";
      }
      return detail;
    }
  }

  return "No se pudo completar el registro. Intenta de nuevo.";
}

export async function registerRequest(
  role: "cliente" | "taller",
  data: RegisterRequest,
): Promise<RegisterResponse> {
  if (!API_URL) {
    throw new Error("La URL de la API no está configurada.");
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL.replace(/\/+$/, "")}/auth/registro/${role}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `No se pudo conectar con el servidor (${API_URL}). Verifica que la API esté encendida y que CORS permita este frontend.`,
      );
    }
    throw error;
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(mapErrorMessage(body));
  }

  return (body ?? {}) as RegisterResponse;
}
