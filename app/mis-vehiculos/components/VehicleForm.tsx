"use client";
import { useState } from 'react';

interface VehicleFormProps {
  onAdd: (name: string, model: string, color: string, plate: string) => void;
  onCancel: () => void;
  initialData?: { name: string; model: string; color: string; plate: string };
  isEditing?: boolean;
}

export const VehicleForm = ({ onAdd, onCancel, initialData, isEditing }: VehicleFormProps) => {
  // Los estados se inicializan directamente aquí. 
  // Al cambiar la 'key' en el padre, este componente nace de nuevo con estos valores.
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

    if (model.length < 4) {
      setError('El modelo debe ser un año válido de 4 dígitos (Ej: 2024).');
      return;
    }

    const anioIngresado = parseInt(model);
    const anioActual = new Date().getFullYear();
    if (anioIngresado > anioActual + 1 || anioIngresado < 1900) {
      setError('Por favor, ingresa un año de modelo válido.');
      return;
    }

    if (plate.length < 6) {
      setError('La placa debe tener al menos 6 caracteres.');
      return;
    }

    // Aquí llamamos a onAdd, que en page.tsx se encargará de decidir si guarda uno nuevo o actualiza
    onAdd(name, model, color, plate);
    
    // Solo limpiamos si NO estamos editando (opcional)
    if (!isEditing) {
      setName(''); setModel(''); setColor(''); setPlate('');
    }
  };

  return (
    <div className="form-container" style={{ 
      background: 'white', 
      padding: '20px', 
      borderRadius: '12px', 
      marginBottom: '30px', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      border: isEditing ? '2px solid #3b82f6' : '1px solid #e2e8f0' // Color azul si editamos
    }}>
      <h3 style={{ marginTop: 0 }}>
        {isEditing ? 'Editar Vehículo' : 'Registrar Nuevo Vehículo'}
      </h3>

      {error && (
        <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '10px', fontWeight: 'bold' }}>
          ⚠️ {error}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input 
            className="form-input"
            placeholder="Nombre (Ej: Toyota Hilux)" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input 
            className="form-input"
            type="number"
            placeholder="Modelo (Año)" 
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
          <input 
            className="form-input"
            placeholder="Color" 
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
          <input 
            className="form-input"
            placeholder="Placa (ABC-123)" 
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn-add">
            {isEditing ? 'Guardar Cambios' : 'Guardar Vehículo'}
          </button>
          <button type="button" onClick={onCancel} className="btn-outline" style={{ color: '#ef4444' }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};