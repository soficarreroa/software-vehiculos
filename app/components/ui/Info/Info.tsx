"use client";

import styles from "./Info.module.css";

interface InfoProps {
  children: React.ReactNode;
  severity?: "success" | "warning" | "error";
}

export default function Info({ children, severity = "error" }: InfoProps) {
  return (
    <div className={`${styles.root} ${styles[severity]}`}>
      {children}
    </div>
  );
}
