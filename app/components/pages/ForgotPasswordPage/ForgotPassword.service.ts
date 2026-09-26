const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ForgotPasswordResponse {
  message: string;
}

export async function forgotPasswordRequest(correo: string): Promise<ForgotPasswordResponse> {
  const response = await fetch(`${API_URL}/auth/olvide-contrasena`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo }),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.detail ?? "No se pudo procesar la solicitud. Intenta de nuevo.");
  }

  return body as ForgotPasswordResponse;
}