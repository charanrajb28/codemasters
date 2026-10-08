"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#030805", color: "#ffffff", textAlign: "center", padding: "24px" }}>
      <h1 style={{ fontSize: "72px", fontWeight: 800, color: "#34d399", margin: 0 }}>404</h1>
      <h2 style={{ fontSize: "24px", margin: "16px 0 24px" }}>Page Not Found</h2>
      <p style={{ color: "#a1a1aa", marginBottom: "32px" }}>The requested page could not be found on DSA Runner.</p>
      <Link href="/" style={{ padding: "12px 24px", borderRadius: "10px", backgroundColor: "#10b981", color: "#000000", fontWeight: 700, textDecoration: "none" }}>
        Return Home
      </Link>
    </div>
  );
}
