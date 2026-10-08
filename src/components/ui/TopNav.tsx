"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Terminal,
  LayoutDashboard,
  Code2,
  History,
  ShieldAlert,
  ShieldCheck,
  Activity,
  LogIn,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";
import { Button } from "./Button";
import { logoutAction } from "@/actions/auth-actions";

export interface TopNavProps {
  user?: {
    name?: string;
    email?: string;
    role?: "STUDENT" | "ADMIN";
  } | null;
}

export const TopNav: React.FC<TopNavProps> = ({ user }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const navItems = [
    { label: "Problems", href: "/problems", icon: <Code2 style={{ width: 16, height: 16 }} /> },
    { label: "Submissions", href: "/submissions", icon: <History style={{ width: 16, height: 16 }} /> },
  ];

  if (user?.role === "ADMIN" || pathname?.startsWith("/admin")) {
    navItems.push({
      label: "Admin Portal",
      href: "/admin",
      icon: <ShieldAlert style={{ width: 16, height: 16, color: "#fbbf24" }} />,
    });
  }

  const isActive = (href: string) => pathname?.startsWith(href);

  /* ─── Inline style tokens ─── */
  const headerStyle: React.CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 50,
    width: "100%",
    backgroundColor: "rgba(9,9,11,0.92)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    borderBottom: "1px solid #262626",
  };

  const innerStyle: React.CSSProperties = {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "0 16px",
  };

  const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "64px",
  };

  const brandGroupStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  };

  const logoLinkStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    textDecoration: "none",
    color: "inherit",
  };

  const logoIconStyle: React.CSSProperties = {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#0a0a0a",
    border: "1px solid #262626",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  const desktopNavStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 4,
  };

  const navLinkBase: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    textDecoration: "none",
    color: "inherit",
    transition: "all 0.15s ease",
  };

  const navLinkActive: React.CSSProperties = {
    ...navLinkBase,
    backgroundColor: "#262626",
    color: "#ffffff",
    border: "1px solid #404040",
  };

  const navLinkInactive: React.CSSProperties = {
    ...navLinkBase,
    color: "#a3a3a3",
    border: "1px solid transparent",
  };

  const rightSectionStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 16,
  };

  const statusPillStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 12px",
    borderRadius: 999,
    backgroundColor: "rgba(10,10,10,0.8)",
    border: "1px solid #262626",
    fontSize: 11,
    fontFamily: "monospace",
    color: "#d4d4d4",
  };

  const userSectionStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    paddingLeft: 12,
    borderLeft: "1px solid #262626",
  };

  const avatarStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: "50%",
    backgroundColor: "#0a0a0a",
    border: "1px solid #404040",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#e5e5e5",
    fontWeight: 700,
    fontSize: 12,
    flexShrink: 0,
  };

  const hamburgerStyle: React.CSSProperties = {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#0a0a0a",
    border: "1px solid #262626",
    color: "#a3a3a3",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 0,
  };

  /* ─── Mobile drawer styles ─── */
  const drawerStyle: React.CSSProperties = {
    borderTop: "1px solid #262626",
    backgroundColor: "#050505",
    padding: "16px",
  };

  const mobileNavLinkBase: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 14px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    textDecoration: "none",
    color: "inherit",
    transition: "all 0.15s ease",
  };

  const mobileNavLinkActive: React.CSSProperties = {
    ...mobileNavLinkBase,
    backgroundColor: "#1a1a1a",
    color: "#ffffff",
    fontWeight: 600,
    border: "1px solid #404040",
  };

  const mobileNavLinkInactive: React.CSSProperties = {
    ...mobileNavLinkBase,
    color: "#a3a3a3",
    border: "1px solid transparent",
  };

  return (
    <header style={headerStyle}>
      <div style={innerStyle}>
        <div style={rowStyle}>

          {/* ── Left: Brand + Desktop Nav ── */}
          <div style={brandGroupStyle}>
            <Link href="/" style={logoLinkStyle}>
              <div style={logoIconStyle}>
                <Terminal style={{ width: 18, height: 18, color: "#34d399" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                  DSA<span style={{ color: "#34d399" }}>RUNNER</span>
                </span>
                <span style={{ fontSize: 10, fontFamily: "monospace", color: "#525252", lineHeight: 1.2 }}>
                  AWS EKS Platform
                </span>
              </div>
            </Link>

            {/* Desktop navigation links */}
            {!isMobile && (
              <nav style={desktopNavStyle}>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={isActive(item.href) ? navLinkActive : navLinkInactive}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            )}
          </div>

          {/* ── Right: Status + User (desktop) ── */}
          {!isMobile && (
            <div style={rightSectionStyle}>
              {/* EKS Status pill */}
              <div style={statusPillStyle}>
                <Activity style={{ width: 13, height: 13, color: "#34d399" }} />
                <span>EKS Operational</span>
              </div>

              {user ? (
                <div style={userSectionStyle}>
                  <Link
                    href={user.role === "ADMIN" ? "/admin" : "/dashboard"}
                    title={user.role === "ADMIN" ? "Go to Admin Portal" : "Go to Dashboard"}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      textDecoration: "none",
                      color: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>
                        {user.name || user.email}
                      </div>
                      <div style={{ fontSize: 10, fontFamily: "monospace", color: "#a3a3a3", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                        {user.role === "ADMIN" ? (
                          <span style={{ color: "#fbbf24", display: "flex", alignItems: "center", gap: 4 }}>
                            <ShieldCheck style={{ width: 11, height: 11 }} /> Admin
                          </span>
                        ) : (
                          "Student"
                        )}
                      </div>
                    </div>
                    <div style={avatarStyle}>
                      {user.name ? user.name.charAt(0).toUpperCase() : <User style={{ width: 14, height: 14 }} />}
                    </div>
                  </Link>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      title="Sign out"
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#525252", display: "flex", alignItems: "center", padding: 4 }}
                    >
                      <LogOut style={{ width: 15, height: 15 }} />
                    </button>
                  </form>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="text-xs border-neutral-800 text-neutral-300">
                      <LogIn style={{ width: 13, height: 13, marginRight: 6 }} /> Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm" className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white border-none">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ── Hamburger (mobile only) ── */}
          {isMobile && (
            <button
              style={hamburgerStyle}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen
                ? <X style={{ width: 20, height: 20 }} />
                : <Menu style={{ width: 20, height: 20 }} />}
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {isMobile && mobileMenuOpen && (
        <div style={drawerStyle}>
          {/* Nav links */}
          <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                style={isActive(item.href) ? mobileNavLinkActive : mobileNavLinkInactive}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Divider + Status + User */}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #1a1a1a", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, fontFamily: "monospace", color: "#525252", padding: "0 4px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Activity style={{ width: 13, height: 13, color: "#34d399" }} /> System Status
              </span>
              <span style={{ color: "#34d399" }}>EKS Operational</span>
            </div>

            {user ? (
              <Link
                href={user.role === "ADMIN" ? "/admin" : "/dashboard"}
                onClick={() => setMobileMenuOpen(false)}
                style={{ padding: 12, borderRadius: 10, backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a", display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "inherit" }}
              >
                <div style={avatarStyle}>
                  {user.name ? user.name.charAt(0).toUpperCase() : <User style={{ width: 14, height: 14 }} />}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{user.name || user.email}</div>
                  <div style={{ fontSize: 10, fontFamily: "monospace", color: "#a3a3a3" }}>{user.role}</div>
                </div>
              </Link>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full text-xs border-neutral-800 text-neutral-300">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full text-xs bg-emerald-600 text-white">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
