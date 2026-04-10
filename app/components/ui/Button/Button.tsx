"use client";

import styles from "./Button.module.css";

interface ButtonProps {
  children: React.ReactNode;
  color: "green" | "red" | "yellow" | "orange";
  onClick?: () => void;
  disabled?: boolean;
}

export default function Button({ children, color, onClick, disabled }: ButtonProps) {
  return (
    <button 
      className={`${styles.root} ${styles[color]}`} 
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
