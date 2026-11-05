"use client";

import styles from "./Button.module.css";

interface ButtonProps {
  children: React.ReactNode;
  color: "green" | "red" | "yellow" | "orange";
  onClick?: () => void;
  disabled?: boolean;
  /** "button" por defecto: dentro de un <form>, "Cancelar" ya no envía el formulario. */
  type?: "button" | "submit";
}

export default function Button({ children, color, onClick, disabled, type = "button" }: ButtonProps) {
  return (
    <button 
      type={type}
      className={`${styles.root} ${styles[color]}`} 
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
