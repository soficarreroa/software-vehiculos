"use client";

import Button from "../../ui/Button/Button";
import styles from "./talleresaliados.module.css";

interface WorkshopCardProps {
  name: string;
  category: string;
  location: string;
  distance: string;
  rating: number;
  reviews: number;
  icon?: string;
}

export default function WorkshopCard({
  name,
  category,
  location,
  distance,
  rating,
  reviews,
  icon = "🏢",
}: WorkshopCardProps) {
  return (
    <div className={styles.workshopCard}>
      <div className={styles.workshopImage}>{icon}</div>
      <div className={styles.workshopBody}>
        <span className={styles.workshopBadge}>{category}</span>
        <h3 className={styles.workshopName}>{name}</h3>
        <div className={styles.workshopInfo}>
          📍 {location} • {distance}
        </div>
        <div className={styles.workshopFooter}>
          <span className={styles.rating}>
            ⭐ {rating}{" "}
            <span className={styles.ratingSmall}>({reviews} reseñas)</span>
          </span>
          <Button color="green">Contactar</Button>
        </div>
      </div>
    </div>
  );
}
