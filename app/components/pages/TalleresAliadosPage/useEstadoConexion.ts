// app/components/pages/TalleresAliadosPage/useEstadoConexion.ts
"use client";

import { useSyncExternalStore } from "react";

function suscribir(alCambiar: () => void): () => void {
  window.addEventListener("online", alCambiar);
  window.addEventListener("offline", alCambiar);
  return () => {
    window.removeEventListener("online", alCambiar);
    window.removeEventListener("offline", alCambiar);
  };
}

/** Valor en el navegador. */
function leerCliente(): boolean {
  return navigator.onLine;
}

/**
 * Valor durante el render del servidor. Se asume "con conexión" para que
 * el HTML del servidor y el primer render del cliente coincidan y no haya
 * error de hidratación; React corrige el valor real enseguida.
 */
function leerServidor(): boolean {
  return true;
}

/**
 * Devuelve true mientras el navegador tenga red y false cuando la pierde.
 * Se suscribe a los eventos `online` / `offline` del navegador.
 */
export function useEstadoConexion(): boolean {
  return useSyncExternalStore(suscribir, leerCliente, leerServidor);
}