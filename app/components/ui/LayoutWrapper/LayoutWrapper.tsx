"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (!isLoginPage) {
      const usuario = localStorage.getItem("usuario");
      if (!usuario) {
        router.push("/login");
      }
    }
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <main style={{ marginLeft: "260px", flex: 1, padding: "40px" }}>
        {children}
      </main>
    </>
  );
}