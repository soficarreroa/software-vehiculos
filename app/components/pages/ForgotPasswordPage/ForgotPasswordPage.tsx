"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { forgotPasswordSchema, type ForgotPasswordFormValues } from "./ForgotPassword.schema";
import { forgotPasswordRequest } from "./ForgotPassword.service";
import styles from "./ForgotPassword.module.css";

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const result = await forgotPasswordRequest(data.correo);
      setEnviado(result.message);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (enviado) {
    return (
      <div className={styles.confirmacion}>
        <h1 className={styles.title}>Revisa tu correo</h1>
        <p className={styles.confirmacionTexto}>{enviado}</p>
        <p className={styles.switchLink}>
          <Link href="/login">Volver a iniciar sesión</Link>
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <h1 className={styles.title}>¿Olvidaste tu contraseña?</h1>
      <p className={styles.subtitle}>
        Escribe tu correo y te enviamos instrucciones para restablecerla.
      </p>

      <div className={styles.field}>
        <label htmlFor="correo">Correo electrónico</label>
        <input id="correo" type="email" autoComplete="email" {...register("correo")} />
        {errors.correo && <span className={styles.errorText}>{errors.correo.message}</span>}
      </div>

      {serverError && <p className={styles.serverError}>{serverError}</p>}

      <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
        {isSubmitting ? "Enviando..." : "Enviar instrucciones"}
      </button>

      <p className={styles.switchLink}>
        <Link href="/login">Volver a iniciar sesión</Link>
      </p>
    </form>
  );
}