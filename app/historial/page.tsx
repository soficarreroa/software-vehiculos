"use client";
import React, { useState } from "react";

export default function HistorialPage() {
  const [filtroActivo, setFiltroActivo] = useState("Todos");

  const filtros = ["Todos", "Mazda 3", "Renault Duster"];

  return (
    <div className="p-8 bg-white min-h-screen text-black">
      <h1 className="text-3xl font-bold text-gray-800">
        Historial de Reportes
      </h1>
      <p className="text-gray-500 mb-6">
        Consulta y descarga tus valoraciones técnicas pasadas.
      </p>

      {/* BOTONES DE FILTRO */}
      <div className="flex gap-3 mb-8">
        {filtros.map((filtro) => (
          <button
            key={filtro}
            type="button"
            onClick={() => setFiltroActivo(filtro)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium
              transition-all duration-300
              cursor-pointer
              ${
                filtroActivo === filtro
                  ? "bg-blue-600 text-white scale-110 shadow-lg"
                  : "border border-gray-200 text-gray-600 hover:scale-[1.03] hover:shadow-md"
              }
            `}
          >
            {filtro}
          </button>
        ))}
      </div>

      {/* LISTA DE REPORTES */}
      <div className="space-y-4">
        <button
          type="button"
          className="
            w-full text-left
            flex items-center justify-between
            p-4 border border-gray-100 rounded-xl shadow-sm bg-white
            transition-all duration-300
            hover:scale-[1.03] hover:shadow-lg
            cursor-pointer
          "
        >
          <div className="flex items-center gap-6">
            <div className="text-center w-12">
              <p className="text-xl font-bold text-gray-700">22</p>
              <p className="text-xs text-gray-400 uppercase font-semibold">
                FEB
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 text-lg">
                Choque Lateral - Mazda 3
              </h3>
              <p className="text-sm text-gray-500 font-medium">
                Placa: ABC-123 • Valor: $ 1.250.000
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-600 text-xs font-bold rounded-full">
              En espera
            </span>

            <div className="flex items-center gap-2 px-3 py-1 border border-gray-200 rounded-md text-sm text-gray-600">
              <span>📄</span> PDF
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}