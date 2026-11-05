"use client";
import { useState } from 'react';
import styles from './MisVehiculosPage.module.css';
import Button from '@/app/components/ui/Button/Button';

/** Mayúsculas y sin guiones/espacios: "abc-123" y "ABC123" son la misma placa. */
const normalizarPlaca = (valor: string) => valor.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

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

    if (!marca.trim() || !modelo.trim() || !color.trim() || !placa.trim()) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    if (!/^[A-Z0-9]{6}$/.test(normalizarPlaca(placa))) {
      setError('La placa debe tener exactamente 6 caracteres (ej: ABC123).');
      return;
    }

    // No se vacía el formulario aquí: si el servidor rechaza el guardado (placa repetida, error
    // de red...) el usuario conserva lo que escribió. Al guardar bien, la página cierra el formulario.
    onAdd(marca.trim(), modelo.trim(), color.trim(), normalizarPlaca(placa));
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
            placeholder="Placa (Ej: ABC123)" 
            value={placa}
            maxLength={7}
            onChange={(e) => setPlaca(e.target.value.toUpperCase())}
          />
        </div>
        
        <div className={styles.formActions}>
          <Button color="green" type="submit">
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