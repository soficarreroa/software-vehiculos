import { z } from "zod";

export const loginSchema = z.object({
  correo: z.string().min(1, "El correo es obligatorio").email("Ingresa un correo válido"),
  contrasena: z.string().min(1, "La contraseña es obligatoria"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;