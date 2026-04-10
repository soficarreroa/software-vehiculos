"use client";

import Button from "../../ui/Button/Button";
import {
  DEFAULT_WORKSHOP_ICON,
  LOCATION_PREFIX,
  REVIEWS_SUFFIX,
  CONTACT_BUTTON_TEXT,
  CONTACT_BUTTON_COLOR,
} from "../../../../lib/constants/workshop.constants";
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

const WorkshopCard = ({
  name,
  category,
  location,
  distance,
  rating,
  reviews,
  icon = DEFAULT_WORKSHOP_ICON,
}: WorkshopCardProps) => {
  return (
    <div className={styles.workshopCard}>
      <div className={styles.workshopImage}>{icon}</div>
      <div className={styles.workshopBody}>
        <span className={styles.workshopBadge}>{category}</span>
        <h3 className={styles.workshopName}>{name}</h3>
        <div className={styles.workshopInfo}>
          {LOCATION_PREFIX} {location} • {distance}
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
