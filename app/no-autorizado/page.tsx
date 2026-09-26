"use client";

import { useRouter } from "next/navigation";
import styles from "./NoAutorizado.module.css";

export default function NoAutorizadoPage() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <span className={styles.icon}>🚫</span>
        <h1 className={styles.title}>Acceso no autorizado</h1>
        <p className={styles.subtitle}>
          No tienes permiso para ver esta página con tu rol actual.
        </p>
        <button className={styles.button} onClick={() => router.push("/")}>
          Volver al inicio
        </button>
      </div>
    </div>
  );
}