import { z } from "zod";

const passwordFields = {
  contrasena: z.string().min(8, "Mínimo 8 caracteres").max(72, "Máximo 72 caracteres"),
  confirmar_contrasena: z.string().min(1, "Confirma tu contraseña"),
};

const vehicleFields = {
  placa: z.string().trim().min(1, "La placa es obligatoria").optional(),
  marca: z.string().trim().optional(),
  modelo: z.string().trim().optional(),
  color: z.string().trim().optional(),
  anio_fabricacion: z.number().int("El año debe ser un número entero").min(1900).max(2100).optional(),
  tipo_carroceria: z.string().trim().optional(),
  detalles_equipamiento: z.string().trim().optional(),
};

export const clienteRegisterSchema = z
  .object({
  nombre_completo: z.string().trim().min(2, "Ingresa tu nombre completo"),
  correo: z.string().trim().min(1, "El correo es obligatorio").email("Ingresa un correo válido"),
  telefono: z.string().trim().min(7, "Ingresa un teléfono válido"),
  ...passwordFields,
  ...vehicleFields,
  })
  .superRefine((data, ctx) => {
  const vehicleData = [
    data.marca,
    data.modelo,
    data.color,
    data.anio_fabricacion,
    data.tipo_carroceria,
    data.detalles_equipamiento,
  ];

  if (vehicleData.some((value) => value !== undefined && value !== "" && value !== null) && !data.placa) {
    ctx.addIssue({
      code: "custom",
      path: ["placa"],
      message: "La placa es obligatoria si agregas datos del vehículo",
    });
  }
  })
  .refine((data) => data.contrasena === data.confirmar_contrasena, {
    message: "Las contraseñas no coinciden",
    path: ["confirmar_contrasena"],
  });

export const tallerRegisterSchema = z
  .object({
  nombre_representante: z.string().trim().min(2, "Ingresa el nombre del representante"),
  correo_corporativo: z
    .string()
    .trim()
    .min(1, "El correo corporativo es obligatorio")
    .email("Ingresa un correo válido"),
  nombre_comercial: z.string().trim().min(2, "Ingresa el nombre del taller"),
  telefono_taller: z.string().trim().min(7, "Ingresa un teléfono válido"),
  categoria_especialidad: z.string().trim().min(2, "Ingresa la especialidad"),
  direccion_fisica: z.string().trim().min(5, "Ingresa una dirección válida"),
  marcas_soportadas: z.array(z.string().trim().min(1)).min(1, "Agrega al menos una marca"),
  notas_servicios: z.string().trim().optional(),
    ...passwordFields,
  })
  .refine((data) => data.contrasena === data.confirmar_contrasena, {
    message: "Las contraseñas no coinciden",
    path: ["confirmar_contrasena"],
  });

export type ClienteRegisterSchema = z.infer<typeof clienteRegisterSchema>;
export type TallerRegisterSchema = z.infer<typeof tallerRegisterSchema>;
export type RegisterFormValues = ClienteRegisterSchema;
