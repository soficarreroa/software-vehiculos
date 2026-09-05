export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const ROLE_OPTIONS = [
  { value: "cliente", label: "Cliente" },
  { value: "taller", label: "Taller" },
  { value: "admin", label: "Admin" },
];

export const ERROR_MESSAGES = {
  LOAD_ERROR: "No se pudo cargar la información del panel de administrador.",
  ACTION_ERROR: "No se pudo completar la acción. Intenta de nuevo.",
} as const;