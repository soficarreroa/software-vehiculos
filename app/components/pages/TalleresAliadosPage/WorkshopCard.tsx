"use client";

import Button from "../../ui/Button/Button";
import {
  LOCATION_PREFIX,
  REVIEWS_SUFFIX,
  CONTACT_BUTTON_TEXT,
  CONTACT_BUTTON_COLOR,
} from "../../../../lib/constants/workshop.constants";
import styles from "./talleresaliados.module.css";

interface WorkshopCardProps {
  nombre: string;
  category: string;
  direccion: string;
  rating: number;
  reviews: number;
}

const WorkshopCard = ({
  nombre,
  category,
  direccion,
  rating,
  reviews,
}: WorkshopCardProps) => {
  const iconMap: Record<string, string> = {
    "Mecánica general": "🔧",
    "Frenos": "⚙️",
    "Electricidad": "⚡",
    "Carrocería": "🚗",
    "Llantas": "🛞",
  }
  const icon = iconMap[category] ?? "🏪"

  return (
    <div className={styles.workshopCard}>
      <div className={styles.workshopImage}>{icon}</div>
      <div className={styles.workshopBody}>
        <span className={styles.workshopBadge}>{category}</span>
        <h3 className={styles.workshopName}>{nombre}</h3>
        <div className={styles.workshopInfo}>
          {LOCATION_PREFIX} {direccion}
        </div>
        <div className={styles.workshopFooter}>
          <span className={styles.rating}>
            ⭐ {rating}{" "}
            <span className={styles.ratingSmall}>({reviews}{REVIEWS_SUFFIX})</span>
          </span>
          <Button color={CONTACT_BUTTON_COLOR}>{CONTACT_BUTTON_TEXT}</Button>
        </div>
      </div>
    </div>
  );
};

export default WorkshopCard;
