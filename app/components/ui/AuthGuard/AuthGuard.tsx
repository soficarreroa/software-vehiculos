"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { limpiarSesion, sesionVencida } from "@/app/lib/auth/session";

const sinSuscripcion = () => () => {};

function haySesionValida(): boolean {
  if (!localStorage.getItem("access_token")) return false;
  // El access_token dura poco (~1 h). Si ya venció pero hay refresh_token, la sesión sigue
  // viva: la primera petición recibe 401 y authenticatedFetch la renueva sola. Antes se
  // echaba al usuario al login cada hora aunque su sesión era renovable.
  return !sesionVencida() || !!localStorage.getItem("refresh_token");
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  // false en servidor/hidratación; en el cliente refleja si la sesión es válida.
  const autenticado = useSyncExternalStore(sinSuscripcion, haySesionValida, () => false);

  useEffect(() => {
    if (!autenticado) {
      limpiarSesion();
      router.replace("/login");
    }
  }, [autenticado, router]);

  if (!autenticado) return null;

  return <>{children}</>;
}
