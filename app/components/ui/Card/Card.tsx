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
<<<<<<< HEAD
    <div className={`${styles.card} ${styles[direction]}`} onClick={onClick}>
      <div className={styles.iconCircle}>{icon}</div>
      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        <div className={styles.description}>{description}</div>
      </div>
=======
    <div className={styles.card} onClick={onClick}>
      {icon && <div className={styles.iconCircle}>{icon}</div>}
      <div className={styles.title}>{title}</div>
      <div className={styles.description}>{description}</div>
>>>>>>> 70e3759477da2af7629f6fccb1707f80b10de3d7
    </div>
  );
}