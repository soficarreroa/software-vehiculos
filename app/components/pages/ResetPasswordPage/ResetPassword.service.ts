const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ResetPasswordResponse {
  message: string;
}

interface ResetPasswordPayload {
  access_token: string;
  refresh_token: string;
  nueva_contrasena: string;
  confirmar_contrasena: string;
}

export async function resetPasswordRequest(
  payload: ResetPasswordPayload
): Promise<ResetPasswordResponse> {
  const response = await fetch(`${API_URL}/auth/restablecer-contrasena`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.detail ?? "No se pudo actualizar la contraseña. Intenta de nuevo.");
  }

  return body as ResetPasswordResponse;
}