"use client";

interface VehicleCardProps {
  id: number;
  name: string;
  model: string;
  color: string;
  plate: string;
  icon: string;
  onEdit: () => void;
  onDelete: () => void;
}

// 1. Agregamos 'onEdit' aquí para poder usarlo abajo
export const VehicleCard = ({ name, model, color, plate, icon, onEdit, onDelete }: VehicleCardProps) => {
  return (
    <div className="vehicle-card">
      <div className="vehicle-icon">{icon}</div>
      <div className="vehicle-info">
        <h3>{name}</h3>
        <p>Modelo {model} • {color}</p>
        <div style={{ marginTop: '10px' }}>
          <span className="plate-badge">{plate}</span>
        </div>
      </div>
      <div className="actions">
        {/* 2. Conectamos el evento onClick al botón de Editar */}
        <button className="btn-outline" onClick={onEdit}>
          Editar
        </button>
        
        <button className="btn-outline" style={{ color: '#ef4444' }} onClick={onDelete}>
          Eliminar
        </button>
      </div>
    </div>
  );
};