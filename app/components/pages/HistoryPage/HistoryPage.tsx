<<<<<<< HEAD
"use client";

import { useState, useMemo } from 'react';
import styles from './HistoryPage.module.css';
import Card from '../../ui/Card/Card';
import Pill from '../../ui/Pill/Pill';
import { FILTER_DEFAULT, REPORT_STATUS, STATUS_PILL_COLOR } from './History.constants';

type ReportStatus = typeof REPORT_STATUS[keyof typeof REPORT_STATUS];

interface Report {
  id: number;
  vehicle: string;
  plate: string;
  date: Date;
  damage: string;
  value: number;
  status: ReportStatus;
}

const HistoryPage = (): React.ReactElement => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<string>(FILTER_DEFAULT);

  const vehicleFilterOptions: string[] = useMemo(() => {
    const uniqueVehicles = Array.from(new Set(reports.map((report) => report.vehicle)));
    return [FILTER_DEFAULT, ...uniqueVehicles];
  }, [reports]);

  const filteredReports: Report[] = filter === FILTER_DEFAULT
    ? reports
    : reports.filter((report) => report.vehicle === filter);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Historial de Reportes</h1>
        <p className={styles.subtitle}>Consulta y descarga tus valoraciones técnicas pasadas.</p>

        {reports.length > 0 && (
          <div className={styles.filterBar}>
            {vehicleFilterOptions.map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={filter === option ? styles.activeFilter : styles.filterBtn}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className={styles.list}>
        {reports.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No hay informes disponibles</p>
          </div>
        ) : (
          filteredReports.map((report) => {
            const formattedDate = report.date.toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short',
            });
            const [day, month] = formattedDate.split(' ');

            return (
              <Card
                key={report.id}
                direction="row"
                icon={
                  <div className={styles.dateContainer}>
                    <span className={styles.day}>{day}</span>
                    <span className={styles.month}>{month}</span>
                  </div>
                }
                title={`${report.damage} - ${report.vehicle}`}
                description={
                  <div className={styles.detailsRow}>
                    <div className={styles.detailItem}>
                      <span>Plate:</span> {report.plate}
                    </div>
                    <div className={styles.detailItem}>
                      <span>Value:</span> ${report.value.toLocaleString()}
                    </div>
                    <Pill color={STATUS_PILL_COLOR[report.status]}>
                      {report.status}
                    </Pill>
                  </div>
                }
                onClick={() => alert(`Descargando PDF del reporte ${report.id}`)}
              />
            );
          })
        )}
      </main>
    </div>
  );
};

export default HistoryPage;