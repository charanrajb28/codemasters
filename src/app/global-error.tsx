"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, backgroundColor: "#030805", color: "#ffffff", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px", textAlign: "center" }}>
          <h1 style={{ fontSize: "64px", color: "#ef4444", margin: 0 }}>500</h1>
          <h2 style={{ fontSize: "24px", margin: "16px 0 24px" }}>System Error</h2>
          <p style={{ color: "#a1a1aa", marginBottom: "32px", maxWidth: "500px" }}>
            An unhandled system error occurred. Please try again.
          </p>
          <button
            onClick={() => reset()}
            style={{ padding: "12px 24px", borderRadius: "10px", backgroundColor: "#10b981", color: "#000000", fontWeight: 700, border: "none", cursor: "pointer" }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
