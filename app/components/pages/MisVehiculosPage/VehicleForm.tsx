"use client";
import { useState } from 'react';
import styles from './MisVehiculosPage.module.css';
import Button from '@/app/components/ui/Button/Button';

interface VehicleFormProps {
  onAdd: (name: string, model: string, color: string, plate: string) => void;
  onCancel: () => void;
  initialData?: { name: string; model: string; color: string; plate: string };
  isEditing?: boolean;
}

export const VehicleForm = ({ onAdd, onCancel, initialData, isEditing }: VehicleFormProps) => {
  const [name, setName] = useState(initialData?.name || '');
  const [model, setModel] = useState(initialData?.model || '');
  const [color, setColor] = useState(initialData?.color || '');
  const [plate, setPlate] = useState(initialData?.plate || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !model || !color || !plate) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    const anioIngresado = parseInt(model);
    const anioActual = new Date().getFullYear();
    if (model.length < 4 || anioIngresado > anioActual + 1 || anioIngresado < 1900) {
      setError('Por favor, ingresa un año de modelo válido.');
      return;
    }

    if (plate.length < 6) {
      setError('La placa debe tener al menos 6 caracteres.');
      return;
    }

    onAdd(name, model, color, plate);
    
    if (!isEditing) {
      setName(''); setModel(''); setColor(''); setPlate('');
    }
  };

  return (
    <div className={`${styles.formContainer} ${isEditing ? styles.editingBorder : ''}`}>
      <h3 className={styles.formTitle}>
        {isEditing ? 'Editar Vehículo' : 'Registrar Nuevo Vehículo'}
      </h3>

      {error && (
        <p className={styles.errorMessage}>
          ⚠️ {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className={styles.formElement}>
        <div className={styles.inputGroup}>
          <input 
            className={styles.formInput}
            placeholder="Nombre (Ej: Toyota Hilux)" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input 
            className={styles.formInput}
            type="number"
            placeholder="Modelo (Año)" 
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
          <input 
            className={styles.formInput}
            placeholder="Color" 
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
          <input 
            className={styles.formInput}
            placeholder="Placa (ABC-123)" 
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
          />
        </div>
        
        <div className={styles.formActions}>
          <Button color="green">
            {isEditing ? 'Guardar Cambios' : 'Guardar Vehículo'}
          </Button>
          <Button onClick={onCancel} color="red">
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};