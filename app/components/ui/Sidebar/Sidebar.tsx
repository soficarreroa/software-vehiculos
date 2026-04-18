"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";

const menuItems = [
  { label: "Inicio", href: "/" },
  { label: "Mis Vehículos", href: "/mis-vehiculos" },
  { label: "Cotización", href: "/cotizacion" },
  { label: "Historial", href: "/historial" },
  { label: "Talleres Aliados", href: "/talleres-aliados" },
  { label: "Marco Legal", href: "/marco-legal" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>🚗 AutoPerito</div>
      {menuItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`${styles.navLink} ${pathname === item.href ? styles.navLinkActive : ""}`}
        >
          {item.label}
        </Link>
      ))}
      <div className={styles.footer}>
  <Link href="#" className={styles.navLink}>
    Ajustes
  </Link>
  <button
    className={styles.navLink}
    style={{ background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left", color: "#94a3b8" }}
    onClick={() => {
      localStorage.removeItem("usuario");
      window.location.href = "/login";
    }}
  >
    Cerrar sesión
  </button>
</div>
    </nav>
  );
}
