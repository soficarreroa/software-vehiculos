import { z } from "zod";

export const SUPPORTED_BRANDS = [
  "Chevrolet",
  "Renault",
  "Mazda",
  "Toyota",
  "Kia",
  "Nissan",
  "Hyundai",
  "Volkswagen",
  "Ford",
  "BMW",
  "Mercedes-Benz",
] as const;

export const VEHICLE_MODELS = [
  "Spark",
  "Onix",
  "Logan",
  "Duster",
  "Mazda 3",
  "Corolla",
  "Sportage",
  "Civic",
] as const;

export const VEHICLE_COLORS = ["Blanco", "Negro", "Gris", "Rojo", "Azul", "Plata", "Verde", "Amarillo", "Café"] as const;
export const BODY_TYPES = ["Sedán", "Hatchback", "SUV", "Pickup", "Camioneta", "Coupé", "Convertible", "Van", "Moto"] as const;

const emailSchema = z
  .string()
  .trim()
  .min(1, "El correo es obligatorio")
  .regex(/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]{2,64}@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z]{2,})+$/, "Ingresa un correo válido");

const phoneSchema = z
  .string()
  .regex(/^3\d{2}(?: ?\d{3})(?: ?\d{4})$/, "Ingresa un celular colombiano de 10 dígitos que empiece por 3");

const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .max(72, "Máximo 72 caracteres")
  .regex(/[A-Z]/, "Incluye al menos una mayúscula")
  .regex(/[a-z]/, "Incluye al menos una minúscula")
  .regex(/\d/, "Incluye al menos un número")
  .regex(/[@$!%*?&]/, "Incluye al menos un carácter especial (@ $ ! % * ? &)");

const passwordFields = {
  contrasena: passwordSchema,
  confirmar_contrasena: z.string().min(1, "Confirma tu contraseña"),
};

const vehicleFields = {
  placa: z
    .string()
    .trim()
    .regex(/^[A-Z]{3}(?:\d{3}|\d{2}[A-Z])$/, "Usa ABC123 o ABC12D")
    .optional()
    .or(z.literal("")),
  marca: z.enum(SUPPORTED_BRANDS).optional().or(z.literal("")),
  modelo: z.enum(VEHICLE_MODELS).optional().or(z.literal("")),
  color: z.enum(VEHICLE_COLORS).optional().or(z.literal("")),
  anio_fabricacion: z.number().int("El año debe ser un número entero").min(1960).max(new Date().getFullYear() + 1).optional(),
  tipo_carroceria: z.enum(BODY_TYPES).optional().or(z.literal("")),
  detalles_equipamiento: z.string().trim().optional(),
};

export const clienteRegisterSchema = z
  .object({
  nombre_completo: z.string().trim().min(2, "Ingresa tu nombre completo"),
  correo: emailSchema,
  telefono: phoneSchema,
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
  correo_corporativo: emailSchema,
  nombre_comercial: z.string().trim().min(2, "Ingresa el nombre del taller"),
  telefono_taller: phoneSchema,
  categoria_especialidad: z.string().trim().min(2, "Agrega al menos una especialidad"),
  direccion_fisica: z.string().trim().min(5, "Ingresa una dirección válida"),
  marcas_soportadas: z
    .array(z.enum(SUPPORTED_BRANDS))
    .min(1, "Agrega al menos una marca"),
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
