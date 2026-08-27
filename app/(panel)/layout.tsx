import Sidebar from "@/app/components/ui/Sidebar/Sidebar";
import AuthGuard from "@/app/components/ui/AuthGuard/AuthGuard";

export default function PanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <Sidebar />
      <main className="layoutMain">{children}</main>
    </AuthGuard>
  );
}