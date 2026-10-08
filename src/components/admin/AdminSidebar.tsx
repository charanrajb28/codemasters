"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Code2,
  Users,
  Plus,
  ChevronLeft,
  ChevronRight,
  Shield,
  Settings,
} from "lucide-react";

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navItems = [
    { label: "Overview", href: "/admin", exact: true, icon: <LayoutDashboard size={18} /> },
    { label: "Problems List", href: "/admin/problems", exact: false, icon: <Code2 size={18} /> },
    { label: "User List", href: "/admin/users", exact: false, icon: <Users size={18} /> },
    { label: "Create Problem", href: "/admin/problems/new", exact: true, icon: <Plus size={18} /> },
  ];

  const isActive = (item: { href: string; exact: boolean }) => {
    if (!pathname) return false;
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  if (isMobile) {
    // Horizontal tabs on mobile devices
    return (
      <nav
        style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          paddingBottom: "12px",
          marginBottom: "16px",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 14px",
                borderRadius: "var(--radius-sm)",
                fontSize: "13px",
                fontWeight: 600,
                whiteSpace: "nowrap",
                textDecoration: "none",
                color: active ? "#ffffff" : "var(--text-secondary)",
                backgroundColor: active ? "#262626" : "#0f0f0f",
                border: active ? "1px solid #404040" : "1px solid #262626",
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <aside
      style={{
        width: collapsed ? "68px" : "220px",
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-md)",
        padding: "16px 12px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        transition: "width 0.2s ease-in-out",
        flexShrink: 0,
        height: "fit-content",
        position: "sticky",
        top: "84px",
      }}
    >
      {/* Sidebar Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          paddingBottom: "12px",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Shield size={18} color="#fbbf24" />
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff", letterSpacing: "0.02em" }}>
              ADMIN SUITE
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: "none",
            border: "1px solid var(--border-color)",
            borderRadius: "6px",
            color: "var(--text-secondary)",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation List */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "var(--radius-sm)",
                fontSize: "13px",
                fontWeight: active ? 600 : 500,
                textDecoration: "none",
                color: active ? "#ffffff" : "var(--text-secondary)",
                backgroundColor: active ? "#262626" : "transparent",
                border: active ? "1px solid #404040" : "1px solid transparent",
                transition: "all 0.15s ease",
                justifyContent: collapsed ? "center" : "flex-start",
              }}
            >
              <span style={{ color: active ? "#34d399" : "inherit" }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
