import { z } from "zod";

export const registerSchema = z
  .object({
    nombre_completo: z.string().min(2, "Ingresa tu nombre completo"),
    correo: z.string().min(1, "El correo es obligatorio").email("Ingresa un correo válido"),
    telefono: z.string().min(7, "Ingresa un teléfono válido"),
    contrasena: z.string().min(8, "Mínimo 8 caracteres").max(72, "Máximo 72 caracteres"),
    confirmar_contrasena: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.contrasena === data.confirmar_contrasena, {
    message: "Las contraseñas no coinciden",
    path: ["confirmar_contrasena"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;