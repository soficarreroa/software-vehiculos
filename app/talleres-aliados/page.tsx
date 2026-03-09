"use client";

import { useState } from "react";
import WorkshopCard from "../components/pages/TalleresAliadosPage/WorkshopCard";
import SearchBar from "../components/pages/TalleresAliadosPage/SearchBar";
import styles from "../components/pages/TalleresAliadosPage/talleresaliados.module.css";

interface Workshop {
  name: string;
  category: string;
  location: string;
  distance: string;
  rating: number;
  reviews: number;
  icon?: string;
}

const workshops: Workshop[] = [
  {
    name: "Nombre del Taller",
    category: "Categoría del servicio",
    location: "Dirección / Ciudad",
    distance: "Distancia",
    rating: 0,
    reviews: 0,
    icon: "🏢",
  },
  {
    name: "Nombre del Taller",
    category: "Categoría del servicio",
    location: "Dirección / Ciudad",
    distance: "Distancia",
    rating: 0,
    reviews: 0,
    icon: "🛠️",
  },
  {
    name: "Nombre del Taller",
    category: "Categoría del servicio",
    location: "Dirección / Ciudad",
    distance: "Distancia",
    rating: 0,
    reviews: 0,
    icon: "🏪",
  },
];

export default function Page() {
  const [searchValue, setSearchValue] = useState("");
  const [filterValue, setFilterValue] = useState("all");

  const filteredWorkshops = workshops.filter((workshop) => {
    const matchesSearch =
      workshop.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      workshop.location.toLowerCase().includes(searchValue.toLowerCase());
    
    const matchesFilter = 
      filterValue === "all" || 
      workshop.category.toLowerCase().includes(filterValue);
    
    return matchesSearch && matchesFilter;
  });

  return (
    <main className={styles.main}>
      <div className={styles.headerMain}>
        <h1 className={styles.title}>Red de Talleres Aliados</h1>
        <p className={styles.subtitle}>
          Encuentra centros de reparación certificados cerca de ti.
        </p>
      </div>

      <SearchBar onSearch={setSearchValue} onFilterChange={setFilterValue} />

      <div className={styles.gridWorkshops}>
        {filteredWorkshops.map((workshop, index) => (
          <WorkshopCard
            key={index}
            name={workshop.name}
            category={workshop.category}
            location={workshop.location}
            distance={workshop.distance}
            rating={workshop.rating}
            reviews={workshop.reviews}
            icon={workshop.icon}
          />
        ))}
      </div>
    </main>
  );
}
