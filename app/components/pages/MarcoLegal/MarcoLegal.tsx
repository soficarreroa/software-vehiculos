"use client";
import { useState } from "react";
import { legalFrameworkData } from "../../../../lib/constants/marcoLegal.constants";
import { LeyData } from "../../../../types";
import styles from "./MarcoLegal.module.css";

const MarcoLegal = () => {
  const [search, setSearch] = useState("");

  const filteredLaws = legalFrameworkData.filter((law: LeyData) =>
    law.title.toLowerCase().includes(search.toLowerCase()) ||
    law.summary.toLowerCase().includes(search.toLowerCase()) ||
    String(law.year).includes(search)
  );

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Centro de Informacion Legal</h1>
        <p className={styles.subtitle}>
          Conoce tus derechos y deberes en la via segun la normativa vigente.
        </p>
      </div>

      <input
        type="text"
        placeholder="Buscar por ley, año o categoria..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={styles.searchInput}
      />

      {filteredLaws.length === 0 && (
        <div className={styles.noResults}>
          <p>No se encontraron normas con esa busqueda.</p>
        </div>
      )}

      <div className={styles.grid}>
        {filteredLaws.map((law: LeyData) => (
          <div key={law.id} className={styles.lawCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>{law.icon}</span>
              <p className={styles.cardTitle}>{law.title}</p>
            </div>
            <p className={styles.detail}>{law.detail}</p>
            {law.alert && (
              <div className={styles.alertBox}>{law.alert}</div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
};

export default MarcoLegal;