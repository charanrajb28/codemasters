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
  ChevronDown,
  Triangle,
  Activity,
  Lock,
  Layers,
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

  // Pinned container refs
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const section2BgRef = useRef<HTMLDivElement>(null);

  // Hero refs
  const heroRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const heroDemoRef = useRef<HTMLDivElement>(null);
  const floatingBadgesRef = useRef<HTMLDivElement>(null);

  // Features showcase refs
  const feature1Ref = useRef<HTMLDivElement>(null);
  const feature2Ref = useRef<HTMLDivElement>(null);
  const feature3Ref = useRef<HTMLDivElement>(null);
  const vercelSandboxRef = useRef<HTMLDivElement>(null);
  const languageDropdownMenuRef = useRef<HTMLDivElement>(null);
  const executionFooterRef = useRef<HTMLDivElement>(null);

  // Mobile features ref
  const mobileFeaturesRef = useRef<HTMLDivElement>(null);

  // CTA ref
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Initial Hero Entrance Animation
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out", duration: 1 } });
      heroTl
        .fromTo(
          ".hero-stagger",
          { opacity: 0, y: 35 },
          { opacity: 1, y: 0, stagger: 0.15, duration: 0.9 }
        )
        .fromTo(
          heroDemoRef.current,
          { y: 50, scale: 0.96 },
          { y: 0, scale: 1, duration: 1.1 },
          "-=0.5"
        );

      // 2. Bottom CTA Entrance
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

      const mm = gsap.matchMedia();

      // 3. Desktop (>= 1024px): Hero into Feature Sequence Scroll-Jacking
      mm.add("(min-width: 1024px)", () => {
        if (pinContainerRef.current && heroTextRef.current && heroDemoRef.current) {
          const leftRect = heroTextRef.current.getBoundingClientRect();
          const rightRect = heroDemoRef.current.getBoundingClientRect();
          const moveX = (leftRect.left + leftRect.width / 2) - (rightRect.left + rightRect.width / 2) - 80;

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: pinContainerRef.current,
              start: "top top",
              end: "+=3800",     // Scroll travel distance
              pin: true,
              scrub: 1,
            },
          });

          // STEP 1: Hero to Section 2 Transition
          // - Section 2 opaque background slides up over the dissolve canvas
          tl.fromTo(
            section2BgRef.current,
            { yPercent: 100, y: 0 },
            { yPercent: 0, y: 0, duration: 1.8, ease: "power2.inOut" }
          )
            // - Hero text fades out
            .to(heroTextRef.current, { opacity: 0, y: -45, duration: 1 }, "<")
            // - Hero floating badges fade out
            .to(floatingBadgesRef.current, { opacity: 0, duration: 0.6 }, "<")
            // - Editor slides to left with zoom-in then reducing-to-current-size
            .to(heroDemoRef.current, { x: moveX, duration: 2, ease: "power2.inOut" }, "<")
            .to(heroDemoRef.current, { scale: 1.15, duration: 1, ease: "power2.out" }, "<")
            .to(heroDemoRef.current, { scale: 1, duration: 1, ease: "power2.in" }, "<1")

            // STEP 2: Content of First Card Revealed
            .fromTo(
              feature1Ref.current,
              { opacity: 0, y: 40 },
              { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
              "+=0.2"
            )
            // - Later after first card content is revealed: editor pushes further left, becomes smaller, and Vercel sandbox shows up
            .to(heroDemoRef.current, { x: moveX - 110, scale: 0.8, duration: 0.8, ease: "power2.out" }, "+=0.4")
            .fromTo(
              vercelSandboxRef.current,
              { opacity: 0, x: -30 },
              { opacity: 1, x: 0, duration: 0.8, ease: "power2.out" },
              "<0.2"
            )

            // Hold Feature 1 with Vercel sandbox
            .to({}, { duration: 0.8 })

            // STEP 3: Second Content Shows Up -> Disappear of Vercel & Connection + Language Dropdown Expands
            .to(vercelSandboxRef.current, { opacity: 0, x: 25, duration: 0.6, ease: "power2.in" })
            .to(heroDemoRef.current, { x: moveX, scale: 1, duration: 0.8, ease: "power2.out" }, "<")
            .to(feature1Ref.current, { opacity: 0, y: -30, duration: 0.8 }, "<")
            .fromTo(
              feature2Ref.current,
              { opacity: 0, y: 40 },
              { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
              "<0.3"
            )
            .fromTo(
              languageDropdownMenuRef.current,
              { opacity: 0, height: 0 },
              { opacity: 1, height: "auto", duration: 0.6, ease: "power2.out" },
              "<0.2"
            )

            // Hold Feature 2 with Dropdown
            .to({}, { duration: 0.8 })

            // STEP 4: Third Content Shows Up -> Collapse Dropdown + Batch Execution Footer Expands
            .to(feature2Ref.current, { opacity: 0, y: -30, duration: 0.8 })
            .to(languageDropdownMenuRef.current, { opacity: 0, height: 0, duration: 0.5 }, "<")
            .fromTo(
              feature3Ref.current,
              { opacity: 0, y: 40 },
              { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
              "<0.3"
            )
            .fromTo(
              executionFooterRef.current,
              { opacity: 0, height: 0 },
              { opacity: 1, height: "auto", duration: 0.6, ease: "power2.out" },
              "<0.2"
            )

            // Hold Feature 3 briefly before unpinning
            .to({}, { duration: 0.8 });
        }
      });

      // 4. Mobile (< 1024px): Stagger for feature cards
      mm.add("(max-width: 1023px)", () => {
        if (mobileFeaturesRef.current) {
          gsap.fromTo(
            ".feature-card",
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.15,
              ease: "power3.out",
              scrollTrigger: {
                trigger: mobileFeaturesRef.current,
                start: "top 80%",
              },
            }
          );
        }
      });
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
      {/* BASE DISSOLVE BACKGROUND (Continuous fixed canvas at z-index 0) */}
      <GreenSquareGridBackground />

      <style>{`
        .features-mobile { display: block; }
        .features-desktop { display: none; }
        .section-2-bg { display: none; }
        @media (min-width: 1024px) {
          .features-mobile { display: none; }
          .features-desktop { display: grid; }
          .section-2-bg { display: block; }
        }
        @keyframes pulseMove {
          0% { left: 10%; opacity: 0; }
          45% { opacity: 0.6; }
          60% { opacity: 1; }
          95% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
      `}</style>

      {/* SCROLL-JACKED PIN CONTAINER (Contains Hero and Sequential Features) */}
      <div
        ref={pinContainerRef}
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100vh",
          margin: "0 auto",
          overflow: "visible",
        }}
      >
        {/* SECTION 2 OPAQUE BACKGROUND (Slides up from translateY(100%) to translateY(0%) on scroll) */}
        <div
          ref={section2BgRef}
          className="section-2-bg"
          style={{
            position: "absolute",
            top: "-10px",
            left: "-50vw",
            width: "200vw",
            height: "calc(100% + 20px)",
            backgroundColor: "#050505",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />

        {/* HERO SECTION: Height matches screen height (100vh) */}
        <section
          ref={heroRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "1280px",
            margin: "0 auto",
            height: "100vh",
            minHeight: "100vh",
            boxSizing: "border-box",
            padding: "0 24px",
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
              zIndex: 3,
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

          {/* RIGHT DIVISION: HERO CODE PANEL (Sliding, zooming & transforming into Section 2) */}
          <div
            ref={heroDemoRef}
            style={{
              position: "relative",
              zIndex: 3,
              width: "100%",
              maxWidth: "480px",
              perspective: "1200px",
              display: "flex",
              justifyContent: "center",
              overflow: "visible",
              margin: "0 auto",
              opacity: 1,
            }}
          >
            {/* VERCEL SANDBOX CONNECTION TO RIGHT OF EDITOR (BEHIND EDITOR) */}
            <div
              ref={vercelSandboxRef}
              style={{
                position: "absolute",
                top: "50%",
                left: "100%",
                marginTop: "-115px",
                zIndex: 2, // BEHIND the Mac Code Panel (zIndex: 5)
                display: "flex",
                alignItems: "center",
                opacity: 0, // Revealed in Feature 1 after card content shows
                pointerEvents: "auto",
              }}
            >
              {/* Neon connecting data cable - Starts 45px UNDER/BEHIND the editor */}
              <div
                style={{
                  marginLeft: "-45px",
                  width: "85px", // 45px behind editor, 40px visible bridge
                  height: "2px",
                  backgroundColor: "#10b981",
                  boxShadow: "0 0 10px #10b981, 0 0 20px #10b981",
                  position: "relative",
                  flexShrink: 0,
                  zIndex: 1,
                }}
              >
                {/* Animated pulse packet traveling into sandbox */}
                <div
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    backgroundColor: "#ffffff",
                    position: "absolute",
                    top: "-2.5px",
                    left: "0",
                    boxShadow: "0 0 10px #ffffff, 0 0 16px #10b981",
                    animation: "pulseMove 1.6s infinite ease-in-out",
                  }}
                />
              </div>

              {/* High-Performance Isolated MicroVM Sandbox Chassis */}
              <div
                style={{
                  width: "320px",
                  borderRadius: "16px",
                  backgroundColor: "rgba(10, 11, 15, 0.96)",
                  border: "1px solid rgba(16, 185, 129, 0.35)",
                  boxShadow: "0 0 35px rgba(16, 185, 129, 0.22), 0 25px 60px rgba(0, 0, 0, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  position: "relative",
                  flexShrink: 0,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  userSelect: "none",
                }}
              >
                {/* Socket Jack Node on left edge receiving cable */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "-5px",
                    transform: "translateY(-50%)",
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: "#050608",
                    border: "2px solid #10b981",
                    boxShadow: "0 0 10px #10b981",
                    zIndex: 20,
                  }}
                />

                {/* Top Chassis Header */}
                <div
                  style={{
                    backgroundColor: "#12141a",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                    padding: "9px 13px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "6px",
                        backgroundColor: "#000000",
                        border: "1px solid rgba(16, 185, 129, 0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 0 10px rgba(16, 185, 129, 0.3)",
                      }}
                    >
                      <Triangle size={11} fill="#ffffff" color="#ffffff" style={{ transform: "rotate(180deg)" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "10px", fontWeight: 800, color: "#ffffff", letterSpacing: "0.06em" }}>
                        VERCEL SANDBOX
                      </span>
                      <span style={{ fontSize: "9px", fontFamily: "var(--font-mono)", color: "#71717a" }}>
                        pod-1a · ephemeral microvm
                      </span>
                    </div>
                  </div>

                  {/* Status Pill */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      backgroundColor: "rgba(16, 185, 129, 0.12)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      borderRadius: "999px",
                      padding: "2px 7px",
                    }}
                  >
                    <div
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        backgroundColor: "#10b981",
                        boxShadow: "0 0 8px #10b981",
                      }}
                    />
                    <span style={{ fontSize: "9px", fontWeight: 700, color: "#34d399", letterSpacing: "0.04em" }}>
                      ISOLATED
                    </span>
                  </div>
                </div>

                {/* Telemetry & Resources Grid */}
                <div
                  style={{
                    padding: "10px 13px 8px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                    backgroundColor: "rgba(18, 18, 22, 0.4)",
                  }}
                >
                  {/* Metric 1: CPU */}
                  <div
                    style={{
                      backgroundColor: "rgba(0, 0, 0, 0.4)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      borderRadius: "8px",
                      padding: "6px 8px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Cpu size={10} style={{ color: "#10b981" }} />
                        <span style={{ fontSize: "9px", color: "#a1a1aa", fontWeight: 600 }}>vCPU</span>
                      </div>
                      <span style={{ fontSize: "9.5px", fontFamily: "var(--font-mono)", color: "#34d399", fontWeight: 700 }}>
                        0.8%
                      </span>
                    </div>
                    <div style={{ width: "100%", height: "3px", backgroundColor: "#27272a", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ width: "22%", height: "100%", backgroundColor: "#10b981", borderRadius: "2px" }} />
                    </div>
                  </div>

                  {/* Metric 2: Memory */}
                  <div
                    style={{
                      backgroundColor: "rgba(0, 0, 0, 0.4)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      borderRadius: "8px",
                      padding: "6px 8px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Layers size={10} style={{ color: "#10b981" }} />
                        <span style={{ fontSize: "9px", color: "#a1a1aa", fontWeight: 600 }}>RAM</span>
                      </div>
                      <span style={{ fontSize: "9.5px", fontFamily: "var(--font-mono)", color: "#ffffff", fontWeight: 700 }}>
                        32MB
                      </span>
                    </div>
                    <div style={{ width: "100%", height: "3px", backgroundColor: "#27272a", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ width: "16%", height: "100%", backgroundColor: "#10b981", borderRadius: "2px" }} />
                    </div>
                  </div>
                </div>

                {/* Sandbox Live Log Stream / Terminal Preview */}
                <div
                  style={{
                    margin: "4px 13px 8px",
                    padding: "7px 9px",
                    backgroundColor: "#050608",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: "9.5px",
                    lineHeight: 1.5,
                  }}
                >
                  <div style={{ color: "#71717a", display: "flex", alignItems: "center", gap: "4px", marginBottom: "2px" }}>
                    <Terminal size={9} style={{ color: "#10b981" }} />
                    <span style={{ color: "#10b981", fontWeight: 700 }}>sandbox@pod-1a:~$</span>
                  </div>
                  <div style={{ color: "#d4d4d8" }}>
                    <span style={{ color: "#10b981" }}>✓</span> seccomp-bpf isolation: ON
                  </div>
                  <div style={{ color: "#d4d4d8" }}>
                    <span style={{ color: "#10b981" }}>✓</span> bridge link: <span style={{ color: "#34d399" }}>two_sum.py</span>
                  </div>
                  <div style={{ color: "#71717a" }}>
                    <span>⚡ cold-start latency: </span>
                    <span style={{ color: "#ffffff", fontWeight: 600 }}>14ms</span>
                  </div>
                </div>

                {/* Bottom Chassis Footer */}
                <div
                  style={{
                    padding: "6px 13px",
                    backgroundColor: "#0c0d12",
                    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Lock size={9} style={{ color: "#71717a" }} />
                    <span style={{ fontSize: "8.5px", color: "#71717a" }}>Kernel Sandbox (gVisor)</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Activity size={9} style={{ color: "#10b981" }} />
                    <span style={{ fontSize: "8.5px", fontFamily: "var(--font-mono)", color: "#10b981" }}>
                      Egress: Blocked
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* MAC CODE PANEL (OPAQUE #09090b, PYTHON CODE, NON-SELECTABLE) */}
            <div
              style={{
                position: "relative",
                zIndex: 5,
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
                opacity: 1,
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
                  <div style={{ display: "flex", gap: "6px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#eab308" }} />
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#22c55e" }} />
                  </div>
                  <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#a1a1aa", fontFamily: "var(--font-mono)" }}>
                    two_sum.py
                  </span>
                </div>

                {/* Language Selector Tag & Dropdown */}
                <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  <div
                    style={{
                      fontSize: "11.5px",
                      fontFamily: "var(--font-mono)",
                      color: "#34d399",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      backgroundColor: "rgba(16, 185, 129, 0.1)",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      border: "1px solid rgba(16, 185, 129, 0.25)",
                    }}
                  >
                    <Terminal size={13} style={{ color: "#34d399" }} />
                    <span>Python 3.11</span>
                    <ChevronDown size={14} style={{ color: "#34d399", marginLeft: "4px" }} />
                  </div>

                  {/* Language Dropdown Menu (Expands in Feature 2) */}
                  <div
                    ref={languageDropdownMenuRef}
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: 0,
                      marginTop: "6px",
                      width: "140px",
                      backgroundColor: "#18181b",
                      border: "1px solid #27272a",
                      borderRadius: "8px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.8)",
                      opacity: 0,
                      height: 0,
                      overflow: "hidden",
                      zIndex: 25,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {[
                      { name: "Node.js 18.x" },
                      { name: "C++ (GCC 11)" },
                      { name: "Java 17" },
                    ].map((lang, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: "8px 12px",
                          fontSize: "11.5px",
                          fontFamily: "var(--font-mono)",
                          color: "#a1a1aa",
                          borderBottom: idx < 2 ? "1px solid #27272a" : "none",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <Code2 size={12} />
                        {lang.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Python Code Content */}
              <div
                style={{
                  padding: "18px 22px",
                  fontFamily: "var(--font-mono), 'Fira Code', monospace",
                  fontSize: "12px",
                  lineHeight: 1.6,
                  color: "#e4e4e7",
                  backgroundColor: "#09090b",
                  whiteSpace: "pre",
                }}
              >
                {PYTHON_CODE_SNIPPET}
              </div>

              {/* Execution Verdict Footer (Expands in Feature 3) */}
              <div
                ref={executionFooterRef}
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
                  opacity: 0,
                  height: 0,
                  overflow: "hidden",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#34d399", fontWeight: 700 }}>
                    <CheckCircle2 size={15} style={{ color: "#34d399" }} />
                    <span>Accepted</span>
                  </div>
                  <span style={{ color: "#3f3f46" }}>|</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "#a1a1aa" }}>
                    Runtime: <strong style={{ color: "#ffffff" }}>38 ms</strong>
                  </span>
                </div>

                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "#34d399",
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    border: "1px solid rgba(16, 185, 129, 0.25)",
                    padding: "3px 8px",
                    borderRadius: "5px",
                    fontWeight: 600,
                    fontSize: "11px",
                  }}
                >
                  3/3 Passed
                </span>
              </div>
            </div>

            {/* SOLID WHITE FLOATING BADGES (IN FRONT OF CODE PANEL - Z-INDEX 35) */}
            <div
              ref={floatingBadgesRef}
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 35,
                pointerEvents: "none",
              }}
            >
              {/* 1. Top-Left Floating */}
              <div
                style={{
                  position: "absolute",
                  top: "-24px",
                  left: "-32px",
                  zIndex: 35,
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
                  transform: `translate(${tilt.badgeX * 0.4 - 4}px, ${tilt.badgeY * 0.4 - 4}px) rotateX(${tilt.rotateX * 0.3}deg) rotateY(${tilt.rotateY * 0.3}deg)`,
                  transition: "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <Zap size={13} style={{ color: "#059669" }} />
                <span>Sub-millisecond Execution</span>
              </div>

              {/* 2. Top-Right Floating */}
              <div
                style={{
                  position: "absolute",
                  top: "-18px",
                  right: "-24px",
                  zIndex: 35,
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
                  zIndex: 35,
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

              {/* 4. Bottom Floating */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-34px",
                  right: "16px",
                  zIndex: 35,
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
            </div>
          </div>
        </section>

        {/* DESKTOP SEQUENTIAL FEATURES (Centered 2-column overlay matching Hero layout) */}
        <div
          className="features-desktop"
          style={{
            position: "absolute",
            inset: 0,
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 24px",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "56px",
            alignItems: "center",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          {/* Left Column Spacer (where the animated editor sits) */}
          <div style={{ width: "100%" }} />

          {/* Right Column: Feature Cards (Centered in column) */}
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "520px",
              minHeight: "260px",
              display: "flex",
              alignItems: "center",
              margin: "0 auto",
            }}
          >
            {/* Feature 1: Isolated Sandbox Environments */}
            <div
              ref={feature1Ref}
              style={{
                position: "absolute",
                opacity: 0,
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                width: "100%",
              }}
            >
              <h3 style={{ fontSize: "28px", fontWeight: 800, color: "#ffffff", margin: 0, letterSpacing: "-0.02em" }}>
                Isolated Sandbox Environments
              </h3>
              <p style={{ fontSize: "16px", color: "#a1a1aa", margin: 0, lineHeight: 1.7 }}>
                Every user submission executes inside a dedicated, ephemeral container runtime with strict kernel-level sandboxing. Benefit from hardened security policies, zero persistent state leaks, and real-time CPU and memory guardrails engineered for high-concurrency algorithm evaluation.
              </p>
            </div>

            {/* Feature 2: Multi-Language Runtimes */}
            <div
              ref={feature2Ref}
              style={{
                position: "absolute",
                opacity: 0,
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                width: "100%",
              }}
            >
              <h3 style={{ fontSize: "28px", fontWeight: 800, color: "#ffffff", margin: 0, letterSpacing: "-0.02em" }}>
                Multi-Language Runtimes
              </h3>
              <p style={{ fontSize: "16px", color: "#a1a1aa", margin: 0, lineHeight: 1.7 }}>
                Write and benchmark algorithms seamlessly across modern programming languages including Python 3.11+, Node.js LTS, C++20 (GCC 13 with -O3 optimization), and Java 21 (OpenJDK). Each environment comes pre-configured with complete standard libraries and identical execution limits.
              </p>
            </div>

            {/* Feature 3: Instant Batch Execution */}
            <div
              ref={feature3Ref}
              style={{
                position: "absolute",
                opacity: 0,
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                width: "100%",
              }}
            >
              <h3 style={{ fontSize: "28px", fontWeight: 800, color: "#ffffff", margin: 0, letterSpacing: "-0.02em" }}>
                Instant Batch Execution
              </h3>
              <p style={{ fontSize: "16px", color: "#a1a1aa", margin: 0, lineHeight: 1.7 }}>
                Submissions are evaluated concurrently across exhaustive test suites with zero queuing overhead. Receive comprehensive performance breakdowns within milliseconds, including exact runtime percentiles, memory consumption charts, and granular test-case verification.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE FEATURES SECTION (< 1024px) */}
      <section
        ref={mobileFeaturesRef}
        className="features-mobile"
        style={{
          position: "relative",
          zIndex: 2,
          padding: "80px 24px",
          width: "100%",
          backgroundColor: "#050505",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <h2 className="feature-card" style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", margin: 0 }}>
              Everything You Need to Excel
            </h2>
            <p className="feature-card" style={{ fontSize: "16px", color: "#a1a1aa", marginTop: "14px", maxWidth: "600px", margin: "14px auto 0" }}>
              Experience an enterprise-grade platform built specifically for mastering data structures and algorithms.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
            }}
          >
            {[
              {
                icon: <Cpu size={24} color="#34d399" />,
                title: "Isolated Sandbox Environments",
                desc: "Every submission runs in a secure, ephemeral container pod. Guaranteed 100% isolation for safe arbitrary code execution.",
              },
              {
                icon: <Code2 size={24} color="#34d399" />,
                title: "Multi-Language Runtimes",
                desc: "Write your solutions in Python, Node.js, C++, or Java. The platform natively supports all major competitive programming languages.",
              },
              {
                icon: <Zap size={24} color="#34d399" />,
                title: "Instant Batch Execution",
                desc: "Your code is evaluated against dozens of test cases simultaneously with zero latency, providing immediate metrics and feedback.",
              },
            ].map((feat, idx) => (
              <div
                key={idx}
                className="feature-card"
                style={{
                  backgroundColor: "rgba(18, 18, 22, 0.7)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(39, 39, 42, 0.6)",
                  borderRadius: "16px",
                  padding: "32px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                  }}
                >
                  {feat.icon}
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#ffffff", margin: 0 }}>
                  {feat.title}
                </h3>
                <p style={{ fontSize: "14px", color: "#a1a1aa", margin: 0, lineHeight: 1.6 }}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: LAST SECTION - CONVERSION CTA CARD (TRANSPARENT BACKGROUND - DISSOLVE BACKGROUND SHINES THROUGH) */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          padding: "90px 24px 120px",
          backgroundColor: "transparent",
          overflow: "hidden",
        }}
      >
        {/* SVG Filter for Liquid Wobbly Glass Refraction Distortion */}
        <svg
          style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}
          aria-hidden="true"
        >
          <defs>
            <filter id="wobbly-glass-distortion" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.012 0.016"
                numOctaves="2"
                result="wobbleNoise"
              >
                <animate
                  attributeName="baseFrequency"
                  dur="14s"
                  values="0.012 0.016; 0.015 0.020; 0.011 0.014; 0.012 0.016"
                  repeatCount="indefinite"
                />
              </feTurbulence>
              <feDisplacementMap
                in="SourceGraphic"
                in2="wobbleNoise"
                scale="18"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>

        <div
          ref={ctaRef}
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "840px",
            margin: "0 auto",
            borderRadius: "28px",
            padding: "64px 48px",
            // Neutral optical glass: NO neon green, pure crystal transmission
            background:
              "linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(10, 10, 12, 0.40) 40%, rgba(4, 4, 6, 0.60) 100%)",
            border: "none", // NO border
            // Neutral optical refraction (IOR = 1.8): Deep dark perimeter bevel, subtle neutral highlight catch, ZERO neon
            boxShadow: [
              // Subtle neutral glass rim reflection
              "inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.16)",
              "inset 1.5px 0 2px 0 rgba(255, 255, 255, 0.08)",
              "inset -1px 0 2px 0 rgba(255, 255, 255, 0.05)",
              // Deep optical refraction perimeter ring
              "inset 0 0 24px 2px rgba(0, 0, 0, 0.85)",
              // Bottom curved bevel shadow
              "inset 0 -3.5px 7px 0 rgba(0, 0, 0, 0.92)",
              // Ambient occlusion and heavy crystal drop shadow
              "0 40px 90px -15px rgba(0, 0, 0, 0.95)",
              "0 16px 32px -8px rgba(0, 0, 0, 0.80)",
            ].join(", "),
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
            overflow: "hidden", // Conforms all refraction layers cleanly to the curved border
          }}
        >
          {/* Wobbly Glass Optical Refraction Layer (Liquid Wavy Refraction) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backdropFilter: "url(#wobbly-glass-distortion)",
              WebkitBackdropFilter: "url(#wobbly-glass-distortion)",
              borderRadius: "inherit",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />

          <h2
            style={{
              position: "relative",
              zIndex: 2,
              fontSize: "clamp(28px, 3.8vw, 42px)",
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-0.02em",
              margin: 0,
              textShadow: "0 2px 14px rgba(0,0,0,0.8)",
            }}
          >
            Ready to Master Data Structures &amp; Algorithms?
          </h2>
          <p
            style={{
              position: "relative",
              zIndex: 2,
              fontSize: "17px",
              color: "#d1d5db",
              margin: 0,
              maxWidth: "620px",
              lineHeight: 1.6,
              textShadow: "0 1px 8px rgba(0,0,0,0.7)",
            }}
          >
            Create an account or sign in to access the problem set and execute code in isolated container pods.
          </p>
          <div
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
              justifyContent: "center",
              marginTop: "12px",
            }}
          >
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

      {/* FOOTER (TRANSPARENT / BLURRED BACKGROUND - DISSOLVE BACKGROUND SHINES THROUGH) */}
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
