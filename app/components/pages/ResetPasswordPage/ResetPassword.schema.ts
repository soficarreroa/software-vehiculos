import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    nuevaContrasena: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmarContrasena: z.string().min(8, "Confirma la nueva contraseña"),
  })
  .refine((data) => data.nuevaContrasena === data.confirmarContrasena, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarContrasena"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;