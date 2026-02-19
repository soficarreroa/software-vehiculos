"use client";

import { useState } from "react";
import Sidebar from "./components/ui/Sidebar";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 md:ml-64 p-8 transition-all duration-300">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Bienvenido
          </h1>
          <p className="text-gray-600">
            Selecciona una opción del menú para comenzar.
          </p>
        </div>
      </main>
    </div>
  );
}
