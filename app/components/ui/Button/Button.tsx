"use client";

import styles from "./Button.module.css";

interface ButtonProps {
  children: React.ReactNode;
  color: "green" | "red" | "yellow" | "orange";
  onClick?: () => void;
}

export default function Button({ children, color, onClick }: ButtonProps) {
  return (
    <button 
      className={`${styles.root} ${styles[color]}`} 
      onClick={onClick}
    >
      {children}
    </button>
  );
}
