"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import {
  Terminal,
  Code2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import { GreenSquareGridBackground } from "./GreenSquareGridBackground";

interface LandingPageClientProps {
  session?: {
    name?: string;
    email?: string;
    role?: "STUDENT" | "ADMIN";
  } | null;
}

const PYTHON_CODE_SNIPPET = `def twoSum(nums: list[int], target: int) -> list[int]:
    # Hash map complement values to indices O(N)
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`;

export const LandingPageClient: React.FC<LandingPageClientProps> = ({ session }) => {
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, badgeX: 0, badgeY: 0 });

  const heroRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const heroDemoRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Hero Entrance Stagger
      const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 1 } });

      tl.fromTo(
        ".hero-stagger",
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, stagger: 0.15, duration: 0.9 }
      ).fromTo(
        heroDemoRef.current,
        { opacity: 0, y: 50, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 1.1 },
        "-=0.5"
      );

      // Bottom CTA Entrance
      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ctaRef.current,
              start: "top 85%",
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const rotateY = (mouseX / (rect.width / 2)) * 8;
    const rotateX = -(mouseY / (rect.height / 2)) * 8;
    const badgeX = (mouseX / (rect.width / 2)) * 8;
    const badgeY = (mouseY / (rect.height / 2)) * 8;

    setTilt({ rotateX, rotateY, badgeX, badgeY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, badgeX: 0, badgeY: 0 });
  };

  return (
    <div
      className="prism-canvas-global"
      style={{
        position: "relative",
        color: "#ffffff",
        fontFamily: "var(--font-sans), 'Figtree', -apple-system, sans-serif",
      }}
    >
      {/* 4-LAYER GREEN SQUARE GRID BACKGROUND */}
      <GreenSquareGridBackground />

      {/* HERO SECTION WITH 2 DIVISIONS: LEFT CONTENT, RIGHT MAC PANEL + WHITE FLOATING BADGES */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "90px 24px 110px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "56px",
          alignItems: "center",
          backgroundColor: "transparent",
          overflow: "visible",
        }}
      >
        {/* LEFT DIVISION: HERO CONTENT */}
        <div
          ref={heroTextRef}
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            textAlign: "left",
            gap: "24px",
          }}
        >
          {/* Headline */}
          <h1
            className="hero-stagger"
            style={{
              fontSize: "clamp(36px, 4.8vw, 64px)",
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-0.035em",
              lineHeight: 1.08,
              margin: 0,
            }}
          >
            High-Performance{" "}
            <span style={{ color: "#10b981" }}>
              DSA Execution Engine
            </span>
          </h1>

          {/* Description */}
          <p
            className="hero-stagger"
            style={{
              fontSize: "clamp(15px, 1.4vw, 19px)",
              color: "#d4d4d8",
              lineHeight: 1.6,
              maxWidth: "580px",
              margin: 0,
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.8)",
            }}
          >
            Solve algorithms in isolated container runtimes. Fast execution, real-time memory profiling, and automated test-case evaluation for software engineers.
          </p>

          {/* Action CTAs */}
          <div
            className="hero-stagger"
            style={{
              display: "flex",
              gap: "14px",
              marginTop: "8px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {session ? (
              <Link
                href={session.role === "ADMIN" ? "/admin" : "/dashboard"}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "14px 28px",
                  borderRadius: "12px",
                  backgroundColor: "#10b981",
                  color: "#000000",
                  fontWeight: 700,
                  fontSize: "15px",
                  textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.5)",
                  transition: "transform 0.2s ease",
                }}
              >
                <span>{session.role === "ADMIN" ? "Go to Admin Portal" : "Go to Dashboard"}</span>
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "14px 28px",
                    borderRadius: "12px",
                    backgroundColor: "#10b981",
                    color: "#000000",
                    fontWeight: 700,
                    fontSize: "15px",
                    textDecoration: "none",
                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.5)",
                    transition: "transform 0.2s ease",
                  }}
                >
                  <Sparkles size={18} />
                  <span>Get Started Free</span>
                </Link>

                <Link
                  href="/login"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "14px 26px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(24, 24, 27, 0.95)",
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: "15px",
                    textDecoration: "none",
                    border: "1px solid #3f3f46",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </Link>
              </>
            )}

            {/* Glassmorphic Browse Problems Button */}
            <Link
              href="/problems"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px 26px",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(16px) saturate(180%)",
                WebkitBackdropFilter: "blur(16px) saturate(180%)",
                border: "1px solid rgba(255, 255, 255, 0.22)",
                boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "15px",
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              <Code2 size={18} style={{ color: "#ffffff" }} />
              <span>Browse Problems</span>
            </Link>
          </div>
        </div>

        {/* RIGHT DIVISION: REDUCED COMPACT MAC CODE PANEL WITH PYTHON CODE, TIGHTER 3D TILT & WHITE BADGES */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            maxWidth: "480px", // Reduced compact editor size
            perspective: "1200px",
            display: "flex",
            justifyContent: "center",
            overflow: "visible",
            margin: "0 auto",
          }}
        >
          {/* SOLID WHITE FLOATING BADGES (DISTINCT 4-WAY PLACEMENT OUTSIDE EDITOR) */}
          {/* 1. Top-Left Floating Above Header */}
          <div
            style={{
              position: "absolute",
              top: "-34px",
              left: "12px",
              zIndex: 12,
              padding: "7px 14px",
              borderRadius: "12px",
              backgroundColor: "#ffffff",
              border: "1px solid rgba(0, 0, 0, 0.1)",
              boxShadow: "0 10px 24px rgba(0, 0, 0, 0.6)",
              display: "flex",
              alignItems: "center",
              gap: "7px",
              fontSize: "11.5px",
              fontWeight: 700,
              color: "#000000",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              transform: `translate(${tilt.badgeX * 0.4}px, ${tilt.badgeY * 0.4 - 4}px) rotateX(${tilt.rotateX * 0.3}deg) rotateY(${tilt.rotateY * 0.3}deg)`,
              transition: "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <Zap size={13} style={{ color: "#059669" }} />
            <span>Sub-millisecond Execution</span>
          </div>

          {/* 2. Top-Right Floating Above Header */}
          <div
            style={{
              position: "absolute",
              top: "-34px",
              right: "12px",
              zIndex: 12,
              padding: "7px 14px",
              borderRadius: "12px",
              backgroundColor: "#ffffff",
              border: "1px solid rgba(0, 0, 0, 0.1)",
              boxShadow: "0 10px 24px rgba(0, 0, 0, 0.6)",
              display: "flex",
              alignItems: "center",
              gap: "7px",
              fontSize: "11.5px",
              fontWeight: 700,
              color: "#000000",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              transform: `translate(${tilt.badgeX * 0.5 + 4}px, ${tilt.badgeY * 0.5 - 4}px) rotateX(${tilt.rotateX * 0.4}deg) rotateY(${tilt.rotateY * 0.4}deg)`,
              transition: "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <ShieldCheck size={13} style={{ color: "#059669" }} />
            <span>Isolated EKS Pod</span>
          </div>

          {/* 3. Left Mid-Side Floating */}
          <div
            style={{
              position: "absolute",
              top: "42%",
              left: "-28px",
              zIndex: 12,
              padding: "7px 14px",
              borderRadius: "12px",
              backgroundColor: "#ffffff",
              border: "1px solid rgba(0, 0, 0, 0.1)",
              boxShadow: "0 10px 24px rgba(0, 0, 0, 0.6)",
              display: "flex",
              alignItems: "center",
              gap: "7px",
              fontSize: "11.5px",
              fontWeight: 700,
              color: "#000000",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              transform: `translate(${tilt.badgeX * 0.4 - 4}px, ${tilt.badgeY * 0.4}px) rotateX(${tilt.rotateX * 0.3}deg) rotateY(${tilt.rotateY * 0.3}deg)`,
              transition: "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <CheckCircle2 size={13} style={{ color: "#059669" }} />
            <span>100% Test Pass Rate</span>
          </div>

          {/* 4. Bottom Floating Below Verdict Footer */}
          <div
            style={{
              position: "absolute",
              bottom: "-34px",
              right: "16px",
              zIndex: 12,
              padding: "7px 14px",
              borderRadius: "12px",
              backgroundColor: "#ffffff",
              border: "1px solid rgba(0, 0, 0, 0.1)",
              boxShadow: "0 10px 24px rgba(0, 0, 0, 0.6)",
              display: "flex",
              alignItems: "center",
              gap: "7px",
              fontSize: "11.5px",
              fontWeight: 700,
              color: "#000000",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              transform: `translate(${tilt.badgeX * 0.5 + 4}px, ${tilt.badgeY * 0.5 + 4}px) rotateX(${tilt.rotateX * 0.4}deg) rotateY(${tilt.rotateY * 0.4}deg)`,
              transition: "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <Cpu size={13} style={{ color: "#059669" }} />
            <span>Real-Time Memory Profiler</span>
          </div>

          {/* MAC CODE PANEL (COMPACT REDUCED SIZE, PYTHON CODE, NON-SELECTABLE, 3D ROTATION) */}
          <div
            ref={heroDemoRef}
            style={{
              width: "100%",
              borderRadius: "16px",
              backgroundColor: "#09090b",
              border: "1px solid #27272a",
              boxShadow: "0 30px 80px rgba(0, 0, 0, 0.95)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
              transformStyle: "preserve-3d",
              transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
              transition: "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
              willChange: "transform",
              cursor: "default",
            }}
          >
            {/* Top Mac Window Header */}
            <div
              style={{
                backgroundColor: "#121215",
                borderBottom: "1px solid #27272a",
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                {/* Mac Window Controls */}
                <div style={{ display: "flex", gap: "6px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#eab308" }} />
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#22c55e" }} />
                </div>
                <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#a1a1aa", fontFamily: "var(--font-mono)" }}>
                  two_sum.py
                </span>
              </div>

              {/* Language Tag */}
              <div
                style={{
                  fontSize: "11.5px",
                  fontFamily: "var(--font-mono)",
                  color: "#34d399",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  padding: "3px 9px",
                  borderRadius: "5px",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                }}
              >
                <Terminal size={13} style={{ color: "#34d399" }} />
                <span>Python 3.11</span>
              </div>
            </div>

            {/* Python Code Editor Content (Compact Size, Disabled Selection) */}
            <div
              style={{
                padding: "18px 22px",
                fontFamily: "var(--font-mono), 'Fira Code', monospace",
                fontSize: "12.5px",
                lineHeight: 1.6,
                color: "#e4e4e7",
                backgroundColor: "#09090b",
                overflowX: "auto",
                textAlign: "left",
                whiteSpace: "pre",
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
              }}
            >
              {PYTHON_CODE_SNIPPET}
            </div>

            {/* Execution Verdict Footer */}
            <div
              style={{
                padding: "10px 18px",
                backgroundColor: "#121215",
                borderTop: "1px solid #27272a",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "8px",
                fontSize: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#34d399", fontWeight: 700 }}>
                  <CheckCircle2 size={15} style={{ color: "#34d399" }} />
                  <span>Accepted</span>
                </div>
                <span style={{ color: "#3f3f46" }}>|</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "#a1a1aa" }}>
                  Runtime: <strong style={{ color: "#ffffff" }}>38 ms</strong>{" "}
                  <span style={{ color: "#34d399" }}>(Beats 94.2%)</span>
                </span>
                <span style={{ color: "#3f3f46" }}>|</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "#a1a1aa" }}>
                  Memory: <strong style={{ color: "#ffffff" }}>14.8 MB</strong>
                </span>
              </div>

              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "#34d399",
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                  padding: "3px 9px",
                  borderRadius: "5px",
                  fontWeight: 600,
                  fontSize: "11px",
                }}
              >
                3/3 Test Cases Passed
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* LAST SECTION: CONVERSION CTA CARD WITH GLASSMORPHIC BUTTON */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          padding: "90px 24px 120px",
          backgroundColor: "transparent",
          overflow: "hidden",
        }}
      >
        <div
          ref={ctaRef}
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "840px",
            margin: "0 auto",
            borderRadius: "26px",
            padding: "60px 44px",
            backgroundColor: "rgba(18, 18, 22, 0.95)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.9)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <h2 style={{ fontSize: "clamp(28px, 3.8vw, 42px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", margin: 0 }}>
            Ready to Master Data Structures &amp; Algorithms?
          </h2>
          <p style={{ fontSize: "17px", color: "#a1a1aa", margin: 0, maxWidth: "620px", lineHeight: 1.6 }}>
            Create an account or sign in to access the problem set and execute code in isolated container pods.
          </p>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center", marginTop: "12px" }}>
            <Link
              href="/register"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px 30px",
                borderRadius: "12px",
                backgroundColor: "#10b981",
                color: "#000000",
                fontWeight: 700,
                fontSize: "15px",
                textDecoration: "none",
                boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
              }}
            >
              <Sparkles size={18} />
              <span>Create Free Account</span>
            </Link>

            {/* Glassmorphic Explore Problem Library Button */}
            <Link
              href="/problems"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px 28px",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(16px) saturate(180%)",
                WebkitBackdropFilter: "blur(16px) saturate(180%)",
                border: "1px solid rgba(255, 255, 255, 0.22)",
                boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "15px",
                textDecoration: "none",
              }}
            >
              <Code2 size={18} style={{ color: "#ffffff" }} />
              <span>Explore Problem Library</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          position: "relative",
          zIndex: 1,
          padding: "48px 24px",
          backgroundColor: "rgba(5, 5, 5, 0.6)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          fontSize: "14px",
          color: "#71717a",
        }}
      >
        <div style={{ maxWidth: "1140px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "10px", backgroundColor: "#0a0a0a", border: "1px solid #262626", display: "flex", alignItems: "center", justifyContent: "center", color: "#34d399" }}>
              <Terminal size={18} />
            </div>
            <span style={{ fontWeight: 800, color: "#ffffff", fontSize: "16.5px", letterSpacing: "-0.01em" }}>DSA RUNNER</span>
          </div>

          <div style={{ display: "flex", gap: "28px" }}>
            <Link href="/problems" style={{ color: "#a1a1aa", textDecoration: "none" }}>Problems</Link>
            <Link href="/submissions" style={{ color: "#a1a1aa", textDecoration: "none" }}>Submissions</Link>
            <Link href="/login" style={{ color: "#a1a1aa", textDecoration: "none" }}>Sign In</Link>
            <Link href="/register" style={{ color: "#a1a1aa", textDecoration: "none" }}>Register</Link>
          </div>

          <div>&copy; {new Date().getFullYear()} DSA Execution Platform. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};
