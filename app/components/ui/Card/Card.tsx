"use client";

import styles from "./Card.module.css";

interface CardProps {
  icon?: React.ReactNode;
  title: string;
  description: React.ReactNode;
  onClick?: () => void;
  direction?: 'column' | 'row';
}

export default function Card({ icon, title, description, onClick, direction = 'column' }: CardProps) {
  return (
    <div className={`${styles.card} ${styles[direction]}`} onClick={onClick}>
      <div className={styles.iconCircle}>{icon}</div>
      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        <div className={styles.description}>{description}</div>
      </div>
    </div>
  );
}