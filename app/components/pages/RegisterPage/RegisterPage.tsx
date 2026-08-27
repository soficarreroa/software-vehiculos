"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { registerSchema, type RegisterFormValues } from "./Register.schema";
import { registerRequest } from "./Register.service";
import styles from "./RegisterPage.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      await registerRequest(data);
      router.push("/login");
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <h1 className={styles.title}>Crear cuenta</h1>

      <div className={styles.field}>
        <label htmlFor="nombre_completo">Nombre completo</label>
        <input id="nombre_completo" type="text" autoComplete="name" {...register("nombre_completo")} />
        {errors.nombre_completo && <span className={styles.errorText}>{errors.nombre_completo.message}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="correo">Correo electrónico</label>
        <input id="correo" type="email" autoComplete="email" {...register("correo")} />
        {errors.correo && <span className={styles.errorText}>{errors.correo.message}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="telefono">Teléfono</label>
        <input id="telefono" type="tel" autoComplete="tel" {...register("telefono")} />
        {errors.telefono && <span className={styles.errorText}>{errors.telefono.message}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="contrasena">Contraseña</label>
        <input id="contrasena" type="password" autoComplete="new-password" {...register("contrasena")} />
        {errors.contrasena && <span className={styles.errorText}>{errors.contrasena.message}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="confirmar_contrasena">Confirmar contraseña</label>
        <input id="confirmar_contrasena" type="password" autoComplete="new-password" {...register("confirmar_contrasena")} />
        {errors.confirmar_contrasena && <span className={styles.errorText}>{errors.confirmar_contrasena.message}</span>}
      </div>

      {serverError && <p className={styles.serverError}>{serverError}</p>}

      <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
        {isSubmitting ? "Registrando..." : "Registrarme"}
      </button>

      <p className={styles.switchLink}>
        ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
      </p>
    </form>
  );
}