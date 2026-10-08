import React from "react";
import { TopNav } from "@/components/ui/TopNav";
import { LandingPageClient } from "@/components/landing/LandingPageClient";
import { getSession } from "@/lib/session";

export default async function LandingPage() {
  const session = await getSession();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#050505",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-sans), 'Figtree', -apple-system, BlinkMacSystemFont, sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* Navigation Header */}
      <TopNav user={session} />

      {/* Fully Animated Landing Page with GSAP ScrollTrigger Transitions */}
      <LandingPageClient session={session} />
    </div>
  );
}

