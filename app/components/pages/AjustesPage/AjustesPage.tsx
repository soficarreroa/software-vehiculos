"use client";

import { useUsuarioSesion } from "@/app/lib/auth/session";
import styles from "./AjustesPage.module.css";

function getInitials(nombre: string) {
  if (!nombre) return "AP";
  const parts = nombre.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AP";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getRoleLabel(rol: string) {
  if (rol === "admin") return "Administrador";
  if (rol === "taller") return "Taller";
  if (rol === "cliente") return "Cliente";
  return rol;
}

export default function AjustesPage() {
  const usuario = useUsuarioSesion();

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Ajustes</h1>
          <p className={styles.subtitle}>Administra y consulta la información de tu cuenta</p>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Mi cuenta</h2>
        {usuario ? (
          <div className={styles.accountCard}>
            <div className={styles.profileHeader}>
              <div className={styles.avatar} aria-label="Iniciales del usuario">
                {getInitials(usuario.nombre_completo)}
              </div>
              <div className={styles.profileInfo}>
                <div className={styles.profileNameRow}>
                  <h3 className={styles.profileName}>{usuario.nombre_completo}</h3>
                  <span className={styles.roleBadge}>{getRoleLabel(usuario.rol)}</span>
                </div>
              </div>
            </div>

            <div className={styles.detailsList}>
              <div className={styles.detailItem}>
                <div className={styles.detailIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="m3 7 9 6 9-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Correo electrónico</span>
                  <span className={styles.detailValue}>{usuario.correo}</span>
                </div>
              </div>
              <div className={styles.detailItem}>
                <div className={styles.detailIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Rol de usuario</span>
                  <span className={styles.detailValue}>{getRoleLabel(usuario.rol)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className={styles.noData}>No hay información de sesión disponible.</p>
        )}
      </section>
    </main>
  );
}
