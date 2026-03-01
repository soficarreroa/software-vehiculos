import React from 'react';

export default function HistorialPage() {
  return (
    <div className="p-8 bg-white min-h-screen text-black">
      <h1 className="text-3xl font-bold text-gray-800">Historial de Reportes</h1>
      <p className="text-gray-500 mb-6">Consulta y descarga tus valoraciones técnicas pasadas.</p>

      {/* Botones de Filtro (Solo visuales) */}
      <div className="flex gap-2 mb-8">
        <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium">Todos</button>
        <button type="button" className="px-4 py-2 border border-gray-200 text-gray-600 rounded-full text-sm font-medium">Mazda 3</button>
        <button type="button" className="px-4 py-2 border border-gray-200 text-gray-600 rounded-full text-sm font-medium">Renault Duster</button>
      </div>

      {/* Lista de Reportes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl shadow-sm bg-white">
          <div className="flex items-center gap-6">
            <div className="text-center w-12">
              <p className="text-xl font-bold text-gray-700">22</p>
              <p className="text-xs text-gray-400 uppercase font-semibold">FEB</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Choque Lateral - Mazda 3</h3>
              <p className="text-sm text-gray-500 font-medium">Placa: ABC-123 • Valor: $ 1.250.000</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-600 text-xs font-bold rounded-full">En espera</span>
            <button type="button" className="flex items-center gap-2 px-3 py-1 border border-gray-200 rounded-md text-sm text-gray-600">
              <span>📄</span> PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}