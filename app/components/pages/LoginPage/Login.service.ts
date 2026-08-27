import type { LoginFormValues } from "./Login.schema";

const API_URL = process.env.NEXT_PUBLIC_API_URL; 

export interface LoginResponseUsuario {
  id: string;
  correo: string;
  nombre_completo: string;
  rol: string;
  auth_id: string;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  usuario: LoginResponseUsuario;
}

export async function loginRequest(data: LoginFormValues): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.detail ?? "No se pudo iniciar sesión. Intenta de nuevo.");
  }

  return body as LoginResponse;
}