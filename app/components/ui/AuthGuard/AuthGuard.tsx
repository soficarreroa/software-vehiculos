"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { limpiarSesion, sesionVencida } from "@/app/lib/auth/session";

const sinSuscripcion = () => () => {};

function haySesionValida(): boolean {
  return !!localStorage.getItem("access_token") && !sesionVencida();
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  // false en servidor/hidratación; en el cliente refleja si la sesión es válida.
  const autenticado = useSyncExternalStore(sinSuscripcion, haySesionValida, () => false);

  useEffect(() => {
    // Se consulta el almacenamiento directamente: durante la hidratación `autenticado`
    // todavía vale false (snapshot del servidor) y no debe cerrar una sesión válida.
    if (!haySesionValida()) {
      limpiarSesion();
      router.replace("/login");
    }
  }, [router]);

  if (!autenticado) return null;

  return <>{children}</>;
}
