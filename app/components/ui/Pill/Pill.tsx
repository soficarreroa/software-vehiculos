"use client";

import styles from "./Pill.module.css";

interface PillProps {
  children: React.ReactNode;
  color?: "success" | "warning" | "error";
}

export default function Pill({ children, color = "success" }: PillProps) {
  return (
    <span className={`${styles.root} ${styles[color]}`}>
      {children}
    </span>
  );
}
