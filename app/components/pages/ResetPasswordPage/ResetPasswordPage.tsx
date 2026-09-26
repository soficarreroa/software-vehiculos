"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";

import { resetPasswordSchema, type ResetPasswordFormValues } from "./ResetPassword.schema";
import { resetPasswordRequest } from "./ResetPassword.service";
import styles from "./ResetPassword.module.css";

interface TokensRecuperacion {
  accessToken: string;
  refreshToken: string;
}

const SIN_LEER = Symbol("sin-leer");

/**
 * Supabase redirige aquí con los tokens en el fragmento de la URL
 * (después del #), no en la ruta ni en query params. El fragmento nunca
 * llega al servidor, así que solo existe del lado del navegador.
 */
function leerTokensDeLaUrl(): TokensRecuperacion | null {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const tipo = params.get("type");

  if (!accessToken || !refreshToken || tipo !== "recovery") return null;
  return { accessToken, refreshToken };
}

function suscribirNoop(): () => void {
  return () => {};
}

/** En el servidor no existe `window`; el valor real se resuelve en el cliente. */
function leerTokensServidor(): TokensRecuperacion | null {
  return null;
}

export default function ResetPasswordPage() {
  // useSyncExternalStore es la forma correcta de leer algo del navegador
  // (aquí, el fragmento de la URL) durante el render: en el servidor y en
  // el primer paint usa leerTokensServidor (null), y React lo reconcilia
  // solo con la lectura real en cuanto hidrata, sin desajuste de
  // hidratación ni setState manual en un efecto.
  const cacheRef = useRef<TokensRecuperacion | null | typeof SIN_LEER>(SIN_LEER);
  const leerTokensCliente = () => {
    if (cacheRef.current === SIN_LEER) {
      cacheRef.current = leerTokensDeLaUrl();
    }
    return cacheRef.current;
  };

  const tokens = useSyncExternalStore(suscribirNoop, leerTokensCliente, leerTokensServidor);

  // Limpia el fragmento una vez leído, para que los tokens no queden
  // visibles en la barra de direcciones ni en el historial del navegador.
  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [tokens]);

  const [serverError, setServerError] = useState<string | null>(null);
  const [actualizada, setActualizada] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!tokens) return;
    setServerError(null);
    setIsSubmitting(true);
    try {
      await resetPasswordRequest({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        nueva_contrasena: data.nuevaContrasena,
        confirmar_contrasena: data.confirmarContrasena,
      });
      setActualizada(true);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  // null cubre dos momentos a la vez: "todavía no hidrató" (coincide con
  // el HTML del servidor) y "el enlace no traía tokens válidos". Ambos se
  // muestran igual un instante; si había tokens de verdad, React corrige
  // la vista al formulario apenas hidrata.
  if (!tokens) {
    return (
      <div className={styles.confirmacion}>
        <h1 className={styles.title}>Enlace inválido o vencido</h1>
        <p className={styles.confirmacionTexto}>
          Este enlace de recuperación no es válido o ya expiró.
        </p>
        <p className={styles.switchLink}>
          <Link href="/olvide-contrasena">Solicitar uno nuevo</Link>
        </p>
      </div>
    );
  }

  if (actualizada) {
    return (
      <div className={styles.confirmacion}>
        <h1 className={styles.title}>Contraseña actualizada</h1>
        <p className={styles.confirmacionTexto}>
          Ya puedes iniciar sesión con tu nueva contraseña.
        </p>
        <p className={styles.switchLink}>
          <Link href="/login">Ir a iniciar sesión</Link>
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <h1 className={styles.title}>Elige una nueva contraseña</h1>

      <div className={styles.field}>
        <label htmlFor="nuevaContrasena">Nueva contraseña</label>
        <div className={styles.passwordWrapper}>
          <input
            id="nuevaContrasena"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            {...register("nuevaContrasena")}
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
        {errors.nuevaContrasena && (
          <span className={styles.errorText}>{errors.nuevaContrasena.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="confirmarContrasena">Confirmar contraseña</label>
        <input
          id="confirmarContrasena"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          {...register("confirmarContrasena")}
        />
        {errors.confirmarContrasena && (
          <span className={styles.errorText}>{errors.confirmarContrasena.message}</span>
        )}
      </div>

      {serverError && <p className={styles.serverError}>{serverError}</p>}

      <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
        {isSubmitting ? "Guardando..." : "Guardar nueva contraseña"}
      </button>
    </form>
  );
}