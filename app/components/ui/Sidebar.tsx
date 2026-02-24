"use client";

import { useState, useEffect } from "react";
import {
  Calculator,
  Eye,
  Search,
  HelpCircle,
  Mail,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
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

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen = true, setIsOpen = () => {} }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [setIsOpen]);

  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md md:hidden hover:bg-gray-50 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X size={24} className="text-gray-700" />
        ) : (
          <Menu size={24} className="text-gray-700" />
        )}
      </button>

      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-out z-50
          ${isMobile ? "w-72" : isCollapsed ? "w-16" : "w-64"}
          ${isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            {!isCollapsed && <span className="text-lg font-semibold text-gray-800">Menú</span>}
            {/* Desktop collapse button */}
            {!isMobile && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                  isCollapsed ? "mx-auto" : "ml-auto"
                }`}
                aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
              >
                {isCollapsed ? (
                  <ChevronRight size={20} className="text-gray-600" />
                ) : (
                  <ChevronLeft size={20} className="text-gray-600" />
                )}
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 overflow-y-auto">
            <ul className="space-y-1 px-2">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 group ${
                      isCollapsed && !isMobile ? "justify-center" : ""
                    }`}
                  >
                    <span className="flex-shrink-0 text-gray-500 group-hover:text-gray-700 transition-colors">
                      {item.icon}
                    </span>
                    {(!isCollapsed || isMobile) && (
                      <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            {!isCollapsed && <p className="text-xs text-gray-400 text-center">© 2026</p>}
          </div>
        </div>
      </aside>
    </>
  );
}
