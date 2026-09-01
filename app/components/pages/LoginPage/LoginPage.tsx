"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";

import { loginSchema, type LoginFormValues } from "./Login.schema";
import { loginRequest } from "./Login.service";
import { rutaPorRol } from "@/app/lib/auth/session";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const result = await loginRequest(data);
      localStorage.setItem("access_token", result.access_token);
      localStorage.setItem("refresh_token", result.refresh_token);
      localStorage.setItem("usuario", JSON.stringify(result.usuario));
      localStorage.setItem("expira_en", String(Date.now() + result.expires_in * 1000));
      router.push(rutaPorRol(result.usuario.rol));
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <h1 className={styles.title}>Iniciar sesión</h1>

      <div className={styles.field}>
        <label htmlFor="correo">Correo electrónico</label>
        <input id="correo" type="email" autoComplete="email" {...register("correo")} />
        {errors.correo && <span className={styles.errorText}>{errors.correo.message}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="contrasena">Contraseña</label>
        <div className={styles.passwordWrapper}>
          <input
            id="contrasena"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            {...register("contrasena")}
          />
          <button
            type="button"
            className={styles.eyeButton}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.contrasena && <span className={styles.errorText}>{errors.contrasena.message}</span>}
      </div>

      {serverError && <p className={styles.serverError}>{serverError}</p>}

      <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
        {isSubmitting ? "Ingresando..." : "Ingresar"}
      </button>

      <p className={styles.switchLink}>
        ¿No tienes cuenta? <Link href="/registro">Regístrate</Link>
      </p>
    </form>
  );
}