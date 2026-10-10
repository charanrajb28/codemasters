"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Terminal,
  Code2,
  CheckCircle2,
  Cpu,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Server,
  Zap,
  Play,
  Layers,
  Activity,
  Gauge,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

interface LaptopScrollHeroProps {
  session?: {
    name?: string;
    email?: string;
    role?: "STUDENT" | "ADMIN";
  } | null;
}

export const LaptopScrollHero: React.FC<LaptopScrollHeroProps> = ({ session }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const laptopWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    // Direct, bulletproof GSAP ScrollTrigger tracking scroll progress
    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.6,
      onUpdate: (self) => {
        const p = self.progress; // 0 to 1 as user scrolls

        // 1. Laptop Scale: 0.85 -> 1.6
        const scale = 0.85 + p * 0.75;
        // 2. 3D Lid Flatten: 14deg -> 0deg
        const rotateX = Math.max(0, 14 * (1 - p * 1.4));
        // 3. Upward Translation to center the laptop screen
        const translateY = -120 * p;
        // 4. Hero Text Fade: 1 -> 0
        const textOpacity = Math.max(0, 1 - p * 2.5);

        if (laptopWrapperRef.current) {
          laptopWrapperRef.current.style.transform = `perspective(1200px) rotateX(${rotateX}deg) scale(${scale}) translateY(${translateY}px)`;
        }

        if (heroTextRef.current) {
          heroTextRef.current.style.opacity = `${textOpacity}`;
          heroTextRef.current.style.transform = `translateY(${-40 * p}px)`;
        }
      },
    });

    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      clearTimeout(refreshTimer);
      st.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        height: "180vh", // 180vh track height for smooth scroll zoom
        width: "100%",
        backgroundColor: "#050505",
      }}
    >
      {/* Sticky Viewport Area */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: "32px",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Background Radial Glow */}
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "900px",
            height: "500px",
            background: "radial-gradient(circle, rgba(52, 211, 153, 0.18) 0%, rgba(52, 211, 153, 0) 70%)",
            filter: "blur(100px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Hero Headline & Intro */}
        <div
          ref={heroTextRef}
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "880px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            padding: "0 24px",
            willChange: "opacity, transform",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(34px, 4.8vw, 60px)",
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              margin: 0,
              fontFamily: "var(--font-sans), 'Figtree', sans-serif",
            }}
          >
            High-Performance{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              DSA Execution
            </span>{" "}
            Platform
          </h1>

          <p
            style={{
              fontSize: "16px",
              color: "#a1a1aa",
              lineHeight: 1.6,
              maxWidth: "680px",
              margin: 0,
              fontFamily: "var(--font-sans), 'Figtree', sans-serif",
            }}
          >
            Solve algorithms in isolated container runtimes. Fast execution, real-time memory profiling, and automated test-case evaluation for software engineers.
          </p>

          {/* Hero CTAs */}
          <div
            style={{
              display: "flex",
              gap: "14px",
              marginTop: "2px",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {session ? (
              <Link
                href={session.role === "ADMIN" ? "/admin" : "/dashboard"}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "11px 24px",
                  borderRadius: "10px",
                  backgroundColor: "#10b981",
                  color: "#000000",
                  fontWeight: 700,
                  fontSize: "14px",
                  textDecoration: "none",
                  boxShadow: "0 4px 20px rgba(16, 185, 129, 0.3)",
                }}
              >
                <span>{session.role === "ADMIN" ? "Go to Admin Portal" : "Go to Dashboard"}</span>
                <ArrowRight size={17} />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "11px 24px",
                    borderRadius: "10px",
                    backgroundColor: "#10b981",
                    color: "#000000",
                    fontWeight: 700,
                    fontSize: "14px",
                    textDecoration: "none",
                    boxShadow: "0 4px 20px rgba(16, 185, 129, 0.3)",
                  }}
                >
                  <Sparkles size={17} />
                  <span>Get Started Free</span>
                </Link>
                <Link
                  href="/login"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "11px 22px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(24, 24, 27, 0.8)",
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: "14px",
                    textDecoration: "none",
                    border: "1px solid #3f3f46",
                  }}
                >
                  <span>Sign In</span>
                  <ArrowRight size={17} />
                </Link>
              </>
            )}
            <Link
              href="/problems"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "11px 22px",
                borderRadius: "10px",
                backgroundColor: "#18181b",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "14px",
                textDecoration: "none",
                border: "1px solid #27272a",
              }}
            >
              <Code2 size={17} style={{ color: "#34d399" }} />
              <span>Browse Problems</span>
            </Link>
          </div>
        </div>

        {/* 3D Laptop Mockup Container */}
        <div
          ref={laptopWrapperRef}
          style={{
            position: "relative",
            zIndex: 1,
            marginTop: "24px",
            width: "100%",
            maxWidth: "860px",
            transformStyle: "preserve-3d",
            transformOrigin: "center top",
            transform: "perspective(1200px) rotateX(14deg) scale(0.85)",
            willChange: "transform",
          }}
        >
          {/* Laptop Display Lid Frame (Space Gray Aluminum Bezel) */}
          <div
            style={{
              position: "relative",
              width: "100%",
              borderRadius: "18px 18px 4px 4px",
              backgroundColor: "#18181b",
              border: "2px solid #3f3f46",
              boxShadow: "0 0 0 3px #09090b, 0 35px 80px rgba(0,0,0,0.95), 0 0 50px rgba(52, 211, 153, 0.15)",
              padding: "8px 8px 12px",
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            {/* Top Camera Notch / Webcam */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "110px",
                height: "12px",
                backgroundColor: "#09090b",
                borderRadius: "0 0 8px 8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                zIndex: 30,
              }}
            >
              {/* Webcam lens */}
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#1e293b", border: "1px solid #0f172a" }} />
              {/* Green active LED */}
              <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#34d399", opacity: 0.9 }} />
            </div>

            {/* Laptop Screen Display Area (NO Inner Scroll - Clean Editor Screen) */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "380px",
                backgroundColor: "#09090b",
                borderRadius: "10px",
                overflow: "hidden",
                border: "1px solid #27272a",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Display Window Top Title Bar */}
              <div
                style={{
                  height: "36px",
                  backgroundColor: "#121215",
                  borderBottom: "1px solid #27272a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 14px",
                  zIndex: 25,
                }}
              >
                <div style={{ display: "flex", gap: "7px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#eab308" }} />
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#22c55e" }} />
                </div>

                <div style={{ fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#a1a1aa", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Terminal size={14} style={{ color: "#34d399" }} />
                  <span>two_sum.py — Python 3.11 Runtime (Vercel Sandbox)</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      fontSize: "10px",
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "#34d399",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      backgroundColor: "rgba(52,211,153,0.1)",
                      border: "1px solid rgba(52,211,153,0.25)",
                    }}
                  >
                    256MB Sandbox
                  </span>
                </div>
              </div>

              {/* Code Editor Sandbox & Verdict Bar */}
              <div style={{ display: "flex", flexDirection: "column", height: "calc(100% - 36px)", backgroundColor: "#09090b", justifyContent: "space-between" }}>
                <div
                  style={{
                    padding: "20px 24px",
                    fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                    fontSize: "13px",
                    lineHeight: 1.7,
                    color: "#e4e4e7",
                    backgroundColor: "#09090b",
                    textAlign: "left",
                    flexGrow: 1,
                  }}
                >
                  <div><span style={{ color: "#f472b6", fontWeight: 600 }}>def</span> <span style={{ color: "#60a5fa", fontWeight: 600 }}>twoSum</span>(nums: <span style={{ color: "#fbbf24" }}>list</span>[<span style={{ color: "#fbbf24" }}>int</span>], target: <span style={{ color: "#fbbf24" }}>int</span>) -&gt; <span style={{ color: "#fbbf24" }}>list</span>[<span style={{ color: "#fbbf24" }}>int</span>]:</div>
                  <div style={{ color: "#525252", paddingLeft: "16px" }}># Hash map complement values to indices</div>
                  <div style={{ paddingLeft: "16px" }}>seen = &#123;&#125;</div>
                  <div style={{ paddingLeft: "16px" }}><span style={{ color: "#f472b6", fontWeight: 600 }}>for</span> i, num <span style={{ color: "#f472b6", fontWeight: 600 }}>in</span> <span style={{ color: "#fbbf24" }}>enumerate</span>(nums):</div>
                  <div style={{ paddingLeft: "32px" }}>complement = target - num</div>
                  <div style={{ paddingLeft: "32px" }}><span style={{ color: "#f472b6", fontWeight: 600 }}>if</span> complement <span style={{ color: "#f472b6", fontWeight: 600 }}>in</span> seen:</div>
                  <div style={{ paddingLeft: "48px" }}><span style={{ color: "#f472b6", fontWeight: 600 }}>return</span> [seen[complement], i]</div>
                  <div style={{ paddingLeft: "32px" }}>seen[num] = i</div>
                  <div style={{ paddingLeft: "16px" }}><span style={{ color: "#f472b6", fontWeight: 600 }}>return</span> []</div>
                </div>

                {/* Verdict Bar */}
                <div
                  style={{
                    padding: "14px 20px",
                    backgroundColor: "#121215",
                    borderTop: "1px solid #27272a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#34d399", fontWeight: 700 }}>
                      <CheckCircle2 size={16} /> Accepted
                    </div>
                    <span style={{ color: "#3f3f46" }}>|</span>
                    <span style={{ fontFamily: "monospace", color: "#a1a1aa" }}>
                      Runtime: <strong style={{ color: "#ffffff" }}>38 ms</strong> <span style={{ color: "#34d399" }}>(Beats 94.2%)</span>
                    </span>
                    <span style={{ color: "#3f3f46" }}>|</span>
                    <span style={{ fontFamily: "monospace", color: "#a1a1aa" }}>
                      Memory: <strong style={{ color: "#ffffff" }}>14.8 MB</strong>
                    </span>
                  </div>

                  <span
                    style={{
                      fontFamily: "monospace",
                      color: "#34d399",
                      backgroundColor: "rgba(52,211,153,0.1)",
                      border: "1px solid rgba(52,211,153,0.3)",
                      padding: "4px 12px",
                      borderRadius: "6px",
                      fontWeight: 600,
                    }}
                  >
                    3/3 Test Cases Passed
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Laptop Hinge & Base Chassis */}
          <div
            style={{
              position: "relative",
              width: "106%",
              left: "-3%",
              height: "15px",
              backgroundColor: "#27272a",
              borderRadius: "0 0 14px 14px",
              border: "1px solid #3f3f46",
              borderTop: "none",
              boxShadow: "0 15px 30px rgba(0,0,0,0.95)",
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            {/* Center Trackpad Opening Lip Notch */}
            <div
              style={{
                width: "110px",
                height: "5px",
                backgroundColor: "#18181b",
                borderRadius: "0 0 5px 5px",
                border: "1px solid #3f3f46",
                borderTop: "none",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

