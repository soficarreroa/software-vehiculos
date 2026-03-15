"use client";

import { useState } from 'react';
import styles from './HistoryPage.module.css';
import Card from '../../ui/Card/Card';
import Button from '../../ui/Button/Button';
import Pill from '../../ui/Pill/Pill';

export default function HistoryPage() {
  const [filtro, setFiltro] = useState('Todos');
  const opciones = ['Todos', 'Mazda 3', 'Renault Duster'];

  const reportes = [
    { id: 1, vehiculo: 'Mazda 3', placa: 'ABC-123', fecha: '22 FEB', daño: 'Choque Lateral', valor: '$ 1.250.000', estado: 'En espera' },
    { id: 2, vehiculo: 'Mazda 3', placa: 'ABC-123', fecha: '10 ENE', daño: 'Raspado Frontal', valor: '$ 450.000', estado: 'Reparado' },
    { id: 3, vehiculo: 'Renault Duster', placa: 'XYZ-789', fecha: '15 NOV', daño: 'Golpe Trasero', valor: '$ 2.100.000', estado: 'Reparado' },
  ];

  const reportesFiltrados = filtro === 'Todos' 
    ? reportes 
    : reportes.filter(r => r.vehiculo === filtro);

  const getPillColor = (estado: string): "success" | "warning" | "error" => {
    switch(estado) {
      case 'Reparado':
        return 'success';
      case 'En espera':
        return 'warning';
      default:
        return 'error';
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.titulo}>Historial de Reportes</h1>
        <p className={styles.subtitulo}>Consulta y descarga tus valoraciones técnicas pasadas.</p>
        
        <div className={styles.filterBar}>
          {opciones.map(op => (
            <button 
              key={op} 
              onClick={() => setFiltro(op)}
              className={filtro === op ? styles.activeFilter : styles.filterBtn}
            >
              {op}
            </button>
          ))}
        </div>
      </header>

      <main className={styles.list}>
        {reportesFiltrados.map((item) => {
          const [dia, mes] = item.fecha.split(' ');
          
          return (
            <div className={styles.reporteCard} key={item.id}>
              {/* Fecha vertical (izquierda) */}
              <div className={styles.fechaContainer}>
                <span className={styles.dia}>{dia}</span>
                <span className={styles.mes}>{mes}</span>
              </div>

              {/* Contenido central con toda la información */}
              <div className={styles.contenidoContainer}>
                {/* Fila superior: título y badge */}
                <div className={styles.tituloRow}>
                  <div className={styles.tituloReporte}>{item.daño} - {item.vehiculo}</div>
                  <Pill color={getPillColor(item.estado)}>
                    {item.estado}
                  </Pill>
                </div>
                
                {/* Fila de detalles: placa y valor */}
                <div className={styles.detallesRow}>
                  <div className={styles.detalleItem}>
                    <span>Placa:</span> {item.placa}
                  </div>
                  <div className={styles.detalleItem}>
                    <span>Valor:</span> {item.valor}
                  </div>
                </div>
              </div>
              
              {/* Botón PDF en la esquina derecha - AHORA CON ESTILO PERSONALIZADO */}
              <div className={styles.pdfButtonContainer}>
                <button 
                  className={styles.pdfBtn}
                  onClick={() => alert(`Descargando PDF del reporte ${item.id}`)}
                >
                  PDF
                </button>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}