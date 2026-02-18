"use client";

import { useState } from "react";
import {
  Calculator,
  Eye,
  Search,
  HelpCircle,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  { label: "Cotizar", href: "#cotizar", icon: <Calculator size={20} /> },
  { label: "Visualizar", href: "#visualizar", icon: <Eye size={20} /> },
  { label: "Buscar", href: "#buscar", icon: <Search size={20} /> },
  { label: "Ayuda", href: "#ayuda", icon: <HelpCircle size={20} /> },
  { label: "Contacto", href: "#contacto", icon: <Mail size={20} /> },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-50 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {!isCollapsed && (
            <span className="text-lg font-semibold text-gray-800">
              Menú
            </span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors ml-auto"
            aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {isCollapsed ? (
              <ChevronRight size={20} className="text-gray-600" />
            ) : (
              <ChevronLeft size={20} className="text-gray-600" />
            )}
          </button>
        </div>

        <nav className="flex-1 py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 group ${
                    isCollapsed ? "justify-center" : ""
                  }`}
                >
                  <span className="flex-shrink-0 text-gray-500 group-hover:text-gray-700 transition-colors">
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          {!isCollapsed && (
            <p className="text-xs text-gray-400 text-center">
              © 2026
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
