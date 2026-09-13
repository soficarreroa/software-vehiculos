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

let refreshPromise: Promise<string | null> | null = null;

async function refrescarToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken =
      typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("expira_en", String(Date.now() + data.expires_in * 1000));
      return data.access_token as string;
    } catch {
      return null;
    }
  })();

  const resultado = await refreshPromise;
  refreshPromise = null;
  return resultado;
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

  let response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    const nuevoToken = await refrescarToken();

    if (nuevoToken) {
      headers.set("Authorization", `Bearer ${nuevoToken}`);
      response = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers,
      });
    }

    if (response.status === 401) {
      handleUnauthorized();
      throw new ApiError("La sesión expiró. Inicia sesión nuevamente.", 401);
    }
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