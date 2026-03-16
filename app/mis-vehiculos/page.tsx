"use client";

import { useState, useEffect } from 'react';
import '../styles/vehicle-styles.css';
import { VehicleCard } from './components/VehicleCard';
import { VehicleForm } from './components/VehicleForm';

// Definición de la interfaz del Vehículo
interface Vehicle {
  id: number;
  name: string;
  model: string;
  color: string;
  plate: string;
  icon: string;
}

export default function MyVehiclesPage() {
  // 1. INICIALIZACIÓN PEREZOSA: Carga segura desde LocalStorage
  const [myVehicles, setMyVehicles] = useState<Vehicle[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('autoPerito_vehicles');
      try {
        return saved ? (JSON.parse(saved) as Vehicle[]) : [];
      } catch (error) {
        console.error("Error al parsear vehículos:", error);
        return [];
      }
    }
    return [];
  });

  // Estados para controlar el formulario y la edición
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // 2. EFECTO DE PERSISTENCIA: Guarda automáticamente al cambiar la lista
  useEffect(() => {
    localStorage.setItem('autoPerito_vehicles', JSON.stringify(myVehicles));
  }, [myVehicles]);

  // 3. FUNCIÓN PARA GUARDAR (Añadir o Editar)
  const guardarVehiculo = (name: string, model: string, color: string, plate: string) => {
    if (editingVehicle) {
      // MODO EDICIÓN: Actualiza el vehículo existente manteniendo su ID
      setMyVehicles(prev => prev.map(v => 
        v.id === editingVehicle.id ? { ...v, name, model, color, plate } : v
      ));
    } else {
      // MODO CREACIÓN: Genera un ID basado en el máximo actual (Pureza de React)
      const nuevoId = myVehicles.length > 0 
        ? Math.max(...myVehicles.map(v => v.id)) + 1 
        : 1;

      const nuevo: Vehicle = {
        id: nuevoId,
        name,
        model,
        color,
        plate,
        icon: "🚗"
      };
      setMyVehicles(prev => [...prev, nuevo]);
    }
    cerrarFormulario();
  };

  // 4. FUNCIONES DE APOYO
  const eliminarVehiculo = (id: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este vehículo?")) {
      setMyVehicles(prev => prev.filter(v => v.id !== id));
    }
  };

  const prepararEdicion = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  };

  const cerrarFormulario = () => {
    setShowForm(false);
    setEditingVehicle(null);
  };

  return (
    <div style={{ padding: '40px', width: '100%' }}>
      {/* SECCIÓN DE CABECERA */}
      <div className="header-section">
        <div>
          <h1 style={{ margin: 0, color: '#0f172a' }}>Mis Vehículos</h1>
          <p style={{ color: '#64748b' }}>Gestiona tus vehículos registrados para tus trámites.</p>
        </div>
        <button className="btn-add" onClick={() => setShowForm(true)}>
          + Añadir Vehículo
        </button>
      </div>

      {showForm && (
        <VehicleForm 
          // Esta KEY es el secreto. Si cambia, el formulario se reinicia solo.
          key={editingVehicle ? `edit-${editingVehicle.id}` : 'new-vehicle'}
          onAdd={guardarVehiculo} 
          onCancel={cerrarFormulario}
          initialData={editingVehicle || undefined}
          isEditing={!!editingVehicle}
        />
      )}

      {/* LISTADO DE VEHÍCULOS */}
      <div style={{ marginTop: '20px' }}>
        {myVehicles.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: '12px' }}>
            <p>Aún no tienes vehículos registrados.</p>
          </div>
        ) : (
          myVehicles.map((vehicle) => (
            <div key={vehicle.id}>
               <VehicleCard 
                {...vehicle}
                onEdit={() => prepararEdicion(vehicle)}
                onDelete={() => eliminarVehiculo(vehicle.id)} 
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}