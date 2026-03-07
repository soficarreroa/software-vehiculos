"use client";

import styles from "./Card.module.css";

interface CardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}

export default function Card({ icon, title, description, onClick }: CardProps) {
  return (
    <div className={styles.card} onClick={onClick}>
      {icon && <div className={styles.iconCircle}>{icon}</div>}
      <div className={styles.title}>{title}</div>
      <div className={styles.description}>{description}</div>
    </div>
  );
}