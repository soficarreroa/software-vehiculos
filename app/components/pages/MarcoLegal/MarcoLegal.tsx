"use client";

import { useState } from "react";
import Card from "../../ui/Card/Card";
import Button from "../../ui/Button/Button";
import Info from "../../ui/Info/Info";
import Pill from "../../ui/Pill/Pill";
import { legalFrameworkData, legalCategories } from "../../../../lib/constants/marcoLegal.constants";
import { LeyData } from "../../../../types";
import styles from "./MarcoLegal.module.css";

const MarcoLegal = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [readItems, setReadItems] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const toggleOpen = (id: number) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleRead = (id: number) => {
    setReadItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filteredLaws = legalFrameworkData.filter((law: LeyData) => {
    const matchesSearch =
      law.title.toLowerCase().includes(search.toLowerCase()) ||
      law.summary.toLowerCase().includes(search.toLowerCase()) ||
      String(law.year).includes(search);
    const matchesCategory =
      activeCategory === "all" || law.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className={styles.main}>
      <div className={styles.headerMain}>
        <div>
          <h1 className={styles.title}>Marco Legal</h1>
          <p className={styles.subtitle}>
            Normativa vigente ordenada cronológicamente.
          </p>
        </div>
        <Pill>SOAT Vigente</Pill>
      </div>

      <Info severity="error">
        <span>¿Necesitas ayuda inmediata en la vía?</span>
        <Button color="red" onClick={() => alert("Llamando asistencia...")}>
          Llamar Asistencia
        </Button>
      </Info>

      <div className={styles.searchWrapper}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          placeholder="Buscar por ley, año o categoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.filters}>
        {legalCategories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`${styles.filterBtn} ${
              activeCategory === cat.value ? styles.filterBtnActive : ""
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <p className={styles.counter}>
        Mostrando <strong>{filteredLaws.length}</strong> de{" "}
        {legalFrameworkData.length} normas ·{" "}
        <strong>{readItems.length}</strong> revisadas
      </p>

      {filteredLaws.length === 0 && (
        <div className={styles.noResults}>
          <span>🔎</span>
          <p>No se encontraron normas con esa búsqueda.</p>
        </div>
      )}

      <div className={styles.grid}>
        {filteredLaws.map((law: LeyData) => {
          const isOpen = openItems.includes(law.id);
          const isRead = readItems.includes(law.id);

          return (
            <div
              key={law.id}
              className={`${styles.lawCard} ${isRead ? styles.lawCardRead : ""} ${isOpen ? styles.lawCardOpen : ""}`}
            >
              <Card
                title={`${law.year} · ${law.title}`}
                description={law.summary}
                onClick={() => toggleOpen(law.id)}
              />

              <div className={styles.cardButtons}>
                <Button color="yellow" onClick={() => toggleOpen(law.id)}>
                  {isOpen ? "▲ Ver menos" : "▼ Ver más"}
                </Button>
                <Button color="green" onClick={() => toggleRead(law.id)}>
                  {isRead ? "✓ Leído" : "Marcar leído"}
                </Button>
              </div>

              {isOpen && (
                <div className={styles.cardBody}>
                  <p className={styles.detail}>{law.detail}</p>
                  {law.alert && (
                    <div className={styles.alertBox}>{law.alert}</div>
                  )}
                  <div className={styles.cardFooter}>
                    <span className={styles.categoryTag}>
                      {legalCategories.find((c: { value: string; label: string }) => c.value === law.category)?.label}
                    </span>
                    <span className={styles.yearTag}>Año {law.year}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
};

export default MarcoLegal;