import { limpiarSesion } from "@/app/lib/auth/session";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function handleUnauthorized() {
  limpiarSesion();
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
}

export async function authenticatedFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new ApiError("La sesión expiró. Inicia sesión nuevamente.", 401);
  }

  return response;
}

export async function readApiError(
  response: Response,
  fallback: string,
): Promise<ApiError> {
  const body = await response.json().catch(() => null);
  if (response.status === 500) {
    return new ApiError("Ocurrió un error interno. Intenta de nuevo.", 500);
  }
  const detail =
    typeof body?.detail === "string" ? body.detail : fallback;
  return new ApiError(detail, response.status);
}
