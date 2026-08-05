"use client";

import { useState } from "react";
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
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <button
        className={styles.hamburger}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Abrir menú"
        aria-expanded={isOpen}
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {isOpen && (
        <div className={styles.backdrop} onClick={closeMenu} aria-hidden="true" />
      )}

      <nav className={`${styles.nav} ${isOpen ? styles.navOpen : ""}`}>
        <div className={styles.logo}>🚗 AutoPerito</div>
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={closeMenu}
            className={`${styles.navLink} ${pathname === item.href ? styles.navLinkActive : ""}`}
          >
            {item.label}
          </Link>
        ))}
        <div className={styles.footer}>
          <Link href="#" onClick={closeMenu} className={styles.navLink}>
            Ajustes
          </Link>
        </div>
      </nav>
    </>
  );
}
