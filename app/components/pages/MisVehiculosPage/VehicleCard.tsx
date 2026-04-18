"use client";
import styles from './MisVehiculosPage.module.css';
import Button from '@/app/components/ui/Button/Button';
import Pill from '@/app/components/ui/Pill/Pill';

interface VehicleCardProps {
  marca: string;
  modelo: string;
  color: string;
  placa: string;
  onEdit: () => void;
  onDelete: () => void;
}

export const VehicleCard = ({ marca, modelo, color, placa, onEdit, onDelete }: VehicleCardProps) => {
  return (
    <div className={styles.vehicleCard}>
      <div className={styles.vehicleIcon}>🚗</div>
      
      <div className={styles.vehicleInfo}>
        <h3>{marca}</h3>
        <p>Modelo {modelo} • {color}</p>
        <div className={styles.plateContainer}>
          {/* Usamos el componente Pill para la placa */}
          <Pill>{placa}</Pill>
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