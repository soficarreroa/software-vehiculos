"use client";

import { useState, useEffect } from 'react';
// Importamos el CSS Module
import styles from './MisVehiculosPage.module.css';
import { VehicleCard } from './VehicleCard';
import { VehicleForm } from './VehicleForm';

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
  // 1. INICIALIZACIÓN PEREZOSA
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

  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // 2. EFECTO DE PERSISTENCIA
  useEffect(() => {
    localStorage.setItem('autoPerito_vehicles', JSON.stringify(myVehicles));
  }, [myVehicles]);

  // 3. FUNCIÓN PARA GUARDAR
  const guardarVehiculo = (name: string, model: string, color: string, plate: string) => {
    if (editingVehicle) {
      setMyVehicles(prev => prev.map(v => 
        v.id === editingVehicle.id ? { ...v, name, model, color, plate } : v
      ));
    } else {
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
    <div className={styles.pageContainer}>
      {/* SECCIÓN DE CABECERA */}
      <div className={styles.headerSection}>
        <div>
          <h1 className={styles.title}>Mis Vehículos</h1>
          <p className={styles.subtitle}>Gestiona tus vehículos registrados para tus trámites.</p>
        </div>
        {/* Aquí podrías usar <Button> de UI si lo tienes */}
        <button className={styles.btnAdd} onClick={() => setShowForm(true)}>
          + Añadir Vehículo
        </button>
      </div>

      {showForm && (
        <VehicleForm 
          key={editingVehicle ? `edit-${editingVehicle.id}` : 'new-vehicle'}
          onAdd={guardarVehiculo} 
          onCancel={cerrarFormulario}
          initialData={editingVehicle || undefined}
          isEditing={!!editingVehicle}
        />
      )}

      {/* LISTADO DE VEHÍCULOS */}
      <div className={styles.listContainer}>
        {myVehicles.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Aún no tienes vehículos registrados.</p>
          </div>
        ) : (
          myVehicles.map((vehicle) => (
            <div key={vehicle.id} className={styles.cardWrapper}>
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