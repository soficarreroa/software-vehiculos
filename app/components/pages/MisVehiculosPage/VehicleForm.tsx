"use client";
import { useState } from 'react';
import styles from './MisVehiculosPage.module.css';
import Button from '@/app/components/ui/Button/Button';

interface VehicleFormProps {
  onAdd: (marca: string, modelo: string, color: string, placa: string) => void;
  onCancel: () => void;
  initialData?: { marca: string; modelo: string; color: string; placa: string };
  isEditing?: boolean;
}

export const VehicleForm = ({ onAdd, onCancel, initialData, isEditing }: VehicleFormProps) => {
  const [marca, setMarca] = useState(initialData?.marca || '');
  const [modelo, setModelo] = useState(initialData?.modelo || '');
  const [color, setColor] = useState(initialData?.color || '');
  const [placa, setPlaca] = useState(initialData?.placa || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!marca || !modelo || !color || !placa) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    // Validar modelo como string (puede ser año o descripción)
    if (!modelo.trim()) {
      setError('Por favor, ingresa un modelo válido.');
      return;
    }

    if (placa.length < 6) {
      setError('La placa debe tener al menos 6 caracteres.');
      return;
    }

    onAdd(marca, modelo, color, placa);

    if (!isEditing) {
      setMarca(''); setModelo(''); setColor(''); setPlaca('');
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
            placeholder="Marca (Ej: Toyota)" 
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
          />
          <input 
            className={styles.formInput}
            placeholder="Modelo (Ej: Hilux 2020)" 
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
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
            value={placa}
            onChange={(e) => setPlaca(e.target.value.toUpperCase())}
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