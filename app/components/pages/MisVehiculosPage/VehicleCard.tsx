"use client";
import styles from './MisVehiculosPage.module.css';
import Button from '@/app/components/ui/Button/Button';
import Pill from '@/app/components/ui/Pill/Pill';

interface VehicleCardProps {
  name: string;
  model: string;
  color: string;
  plate: string;
  icon: string;
  onEdit: () => void;
  onDelete: () => void;
}

export const VehicleCard = ({ name, model, color, plate, icon, onEdit, onDelete }: VehicleCardProps) => {
  return (
    <div className={styles.vehicleCard}>
      <div className={styles.vehicleIcon}>{icon}</div>
      
      <div className={styles.vehicleInfo}>
        <h3>{name}</h3>
        <p>Modelo {model} • {color}</p>
        <div className={styles.plateContainer}>
          {/* Usamos el componente Pill para la placa */}
          <Pill>{plate}</Pill>
        </div>
      </div>

      <div className={styles.actions}>
        <Button onClick={onEdit} color="green">
          Editar
        </Button>
        <Button onClick={onDelete} color="red">
          Eliminar
        </Button>
      </div>
    </div>
  );
};