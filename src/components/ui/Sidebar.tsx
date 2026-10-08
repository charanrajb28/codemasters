"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Code2, 
  History, 
  ShieldAlert, 
  ChevronLeft, 
  ChevronRight,
  Terminal,
  Cpu
} from "lucide-react";

export interface SidebarProps {
  userRole?: "STUDENT" | "ADMIN";
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole = "STUDENT" }) => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/", icon: <LayoutDashboard size={18} /> },
    { label: "Problems", href: "/problems", icon: <Code2 size={18} /> },
    { label: "Submissions", href: "/submissions", icon: <History size={18} /> },
  ];

  if (userRole === "ADMIN") {
    navItems.push({ label: "Admin Portal", href: "/admin", icon: <ShieldAlert size={18} /> });
  }

  const sidebarStyle: React.CSSProperties = {
    width: collapsed ? "64px" : "240px",
    height: "100vh",
    backgroundColor: "var(--bg-surface)",
    borderRight: "1px solid var(--border-color)",
    display: "flex",
    flexDirection: "column",
    transition: "width 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
    position: "sticky",
    top: 0,
    zIndex: 40,
    flexShrink: 0,
  };

  const headerStyle: React.CSSProperties = {
    height: "60px",
    borderBottom: "1px solid var(--border-color)",
    display: "flex",
    alignItems: "center",
    justifyContent: collapsed ? "center" : "space-between",
    padding: collapsed ? "0" : "0 16px",
  };

  const logoTextStyle: React.CSSProperties = {
    fontWeight: 700,
    fontSize: "15px",
    letterSpacing: "-0.02em",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const toggleButtonStyle: React.CSSProperties = {
    background: "transparent",
    border: "none",
    color: "var(--text-secondary)",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "var(--radius-sm)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const navListStyle: React.CSSProperties = {
    listStyle: "none",
    padding: "12px 8px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
  };

  return (
    <aside style={sidebarStyle}>
      <div style={headerStyle}>
        {!collapsed && (
          <div style={logoTextStyle}>
            <Terminal size={20} color="#ffffff" />
            <span>DSA RUNNER</span>
          </div>
        )}
        {collapsed && <Terminal size={20} color="#ffffff" />}
        <button
          style={toggleButtonStyle}
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <ul style={navListStyle}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const linkStyle: React.CSSProperties = {
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "10px 12px",
            borderRadius: "var(--radius-sm)",
            fontSize: "13px",
            fontWeight: 500,
            color: isActive ? "#ffffff" : "var(--text-secondary)",
            backgroundColor: isActive ? "#1c1c1c" : "transparent",
            border: isActive ? "1px solid var(--border-bright)" : "1px solid transparent",
            transition: "all 0.15s ease",
            justifyContent: collapsed ? "center" : "flex-start",
          };

          return (
            <li key={item.href}>
              <Link href={item.href} style={linkStyle} title={collapsed ? item.label : undefined}>
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>

      {!collapsed && (
        <div style={{ padding: "16px", borderTop: "1px solid var(--border-color)", fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
          <Cpu size={14} />
          <span>Runtime: Vercel Sandbox</span>
        </div>
      )}
    </aside>
  );
};
